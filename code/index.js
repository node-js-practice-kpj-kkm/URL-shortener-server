const express = require("express");
const { nanoid } = require("nanoid");
const path = require("path");

const app = express();
const PORT = 3000;

// 메모리에 URL 저장 (실제 서비스면 DB 필요)
const urlDatabase = {};

// JSON 바디 파싱
app.use(express.json());

// 📁 public 폴더 내 정적 파일 제공 (index.html 포함)
app.use(express.static(path.join(__dirname, "")));

// POST /shorten - 단축 URL 생성
app.post("/shorten", (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl || !/^https?:\/\//.test(originalUrl)) {
    return res.status(400).json({ error: "유효한 URL을 입력해주세요." });
  }

  const shortId = nanoid(6);
  urlDatabase[shortId] = originalUrl;

  const shortUrl = `${req.protocol}://${req.get("host")}/${shortId}`;
  res.json({ originalUrl, shortUrl });
});

// GET /:shortId - 리다이렉트
app.get("/:shortId", (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlDatabase[shortId];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send("존재하지 않는 단축 URL입니다.");
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
