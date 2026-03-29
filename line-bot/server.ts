/**
 * 🔮 造命 ZaoMing AI — LINE Bot Demo
 * 
 * 用戶傳生辰 → 即時排盤 → 回傳命理報告
 * 
 * 使用方式：
 *   LINE_CHANNEL_SECRET=xxx LINE_CHANNEL_TOKEN=xxx npx ts-node --transpile-only line-bot/server.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

import express from 'express';
import * as line from '@line/bot-sdk';
import { generateReport } from './report-generator';

// ====== 設定 ======
const config: line.ClientConfig & line.MiddlewareConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  channelAccessToken: process.env.LINE_CHANNEL_TOKEN || '',
};

const PORT = parseInt(process.env.PORT || '3800');

// ====== 用戶狀態管理（記住對話進度）======
interface UserState {
  step: 'idle' | 'await_name' | 'await_date' | 'await_hour' | 'await_gender';
  name?: string;
  date?: string;
  hour?: number;
  gender?: 'male' | 'female';
  lastActive: number;
}

const userStates = new Map<string, UserState>();

function getState(userId: string): UserState {
  if (!userStates.has(userId)) {
    userStates.set(userId, { step: 'idle', lastActive: Date.now() });
  }
  const state = userStates.get(userId)!;
  state.lastActive = Date.now();
  return state;
}

// 清理超過 30 分鐘沒互動的狀態
setInterval(() => {
  const threshold = Date.now() - 30 * 60 * 1000;
  for (const [userId, state] of userStates) {
    if (state.lastActive < threshold) userStates.delete(userId);
  }
}, 5 * 60 * 1000);

// ====== Express 伺服器 ======
const app = express();

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: '造命 ZaoMing AI LINE Bot', version: '0.1.0' });
});

// LINE Webhook
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events: line.WebhookEvent[] = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.json({ ok: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const client = new line.Client(config);

// ====== 事件處理 ======
async function handleEvent(event: line.WebhookEvent): Promise<any> {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const userId = event.source.userId!;
  const text = event.message.text.trim();
  const state = getState(userId);
  const replyToken = event.replyToken;

  // 指令處理
  if (text === '算命' || text === '排盤' || text === '造命' || text === '開始') {
    state.step = 'await_name';
    state.name = undefined;
    state.date = undefined;
    state.hour = undefined;
    state.gender = undefined;
    return client.replyMessage(replyToken, {
      type: 'text',
      text: '🔮 造命 ZaoMing AI — 命理排盤\n\n請輸入你的姓名（中文）：',
    });
  }

  if (text === '取消' || text === '重來') {
    state.step = 'idle';
    return client.replyMessage(replyToken, {
      type: 'text',
      text: '已取消。輸入「算命」重新開始 🔮',
    });
  }

  // 狀態機
  switch (state.step) {
    case 'await_name': {
      if (text.length < 2 || text.length > 5) {
        return client.replyMessage(replyToken, {
          type: 'text',
          text: '⚠️ 請輸入 2-5 個字的中文姓名：',
        });
      }
      state.name = text;
      state.step = 'await_date';
      return client.replyMessage(replyToken, {
        type: 'text',
        text: `✅ 姓名：${text}\n\n請輸入出生日期（格式：1993-08-07 或 1993/08/07）：`,
      });
    }

    case 'await_date': {
      const dateStr = text.replace(/\//g, '-');
      const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (!match) {
        return client.replyMessage(replyToken, {
          type: 'text',
          text: '⚠️ 格式不對喔！請輸入：1993-08-07 或 1993/08/07',
        });
      }
      const [, y, m, d] = match;
      const year = parseInt(y), month = parseInt(m), day = parseInt(d);
      if (year < 1900 || year > 2030 || month < 1 || month > 12 || day < 1 || day > 31) {
        return client.replyMessage(replyToken, {
          type: 'text',
          text: '⚠️ 日期不合理，請重新輸入：',
        });
      }
      state.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      state.step = 'await_hour';
      return client.replyMessage(replyToken, {
        type: 'text',
        text: `✅ 出生日期：${state.date}\n\n請輸入出生時辰（0-23 的數字，例如 9 = 上午9點）：\n\n不知道的話輸入「不知道」（會用 12 點推算）`,
      });
    }

    case 'await_hour': {
      let hour: number;
      if (text === '不知道' || text === '不確定') {
        hour = 12;
      } else {
        hour = parseInt(text);
        if (isNaN(hour) || hour < 0 || hour > 23) {
          return client.replyMessage(replyToken, {
            type: 'text',
            text: '⚠️ 請輸入 0-23 的數字（例如 9 = 上午9點），或輸入「不知道」：',
          });
        }
      }
      state.hour = hour;
      state.step = 'await_gender';
      return client.replyMessage(replyToken, {
        type: 'text',
        text: `✅ 出生時間：${hour}:00\n\n請輸入性別（男/女）：`,
      });
    }

    case 'await_gender': {
      let gender: 'male' | 'female';
      if (text === '男' || text.toLowerCase() === 'male' || text === 'M' || text === 'm') {
        gender = 'male';
      } else if (text === '女' || text.toLowerCase() === 'female' || text === 'F' || text === 'f') {
        gender = 'female';
      } else {
        return client.replyMessage(replyToken, {
          type: 'text',
          text: '⚠️ 請輸入「男」或「女」：',
        });
      }
      state.gender = gender;
      state.step = 'idle';

      // 排盤中...
      await client.replyMessage(replyToken, {
        type: 'text',
        text: `🔮 排盤中...\n\n姓名：${state.name}\n生辰：${state.date} ${state.hour}:00\n性別：${gender === 'male' ? '男' : '女'}\n\n42 系統全力運算中，請稍候...`,
      });

      // 生成報告（用 push message 推送，因為 reply 只能用一次）
      try {
        const report = generateReport({
          name: state.name!,
          solarDate: state.date!,
          hour: state.hour!,
          gender: state.gender!,
        });

        // LINE 訊息有 5000 字限制，分段推送
        const chunks = splitMessage(report, 4500);
        for (const chunk of chunks) {
          await client.pushMessage(userId, { type: 'text', text: chunk });
          // 避免 rate limit
          await new Promise(r => setTimeout(r, 500));
        }
      } catch (err: any) {
        await client.pushMessage(userId, {
          type: 'text',
          text: `⚠️ 排盤時發生錯誤：${err.message}\n\n請重新輸入「算命」再試一次。`,
        });
      }
      return;
    }

    default: {
      // idle 狀態
      return client.replyMessage(replyToken, {
        type: 'text',
        text: '🔮 造命 ZaoMing AI\n\n輸入「算命」開始你的命理排盤！\n\n42 個命理系統 × AI 交叉驗證\n不認命，用 AI 逆天改命。',
      });
    }
  }
}

// ====== 訊息分段 ======
function splitMessage(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  
  const chunks: string[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    
    // 找最近的換行斷點
    let splitAt = remaining.lastIndexOf('\n', maxLen);
    if (splitAt < maxLen * 0.5) splitAt = maxLen; // 沒有好的斷點就硬切
    
    chunks.push(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt).trimStart();
  }
  
  return chunks;
}

// ====== 啟動 ======
app.listen(PORT, () => {
  console.log(`🔮 造命 ZaoMing AI LINE Bot 啟動`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Webhook: POST /webhook`);
  console.log(`   Health: GET /`);
  console.log(`\n   輸入「算命」開始排盤！\n`);
});
