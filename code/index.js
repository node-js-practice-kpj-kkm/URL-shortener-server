const express = require("express");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const path = require("path");

const app = express();
const PORT = 3000;

// MongoDB 연결
const mongoURI = "mongodb://localhost:27017/"; // MongoDB Atlas 연결 문자열
// 로컬 MongoDB 사용 시
// const mongoURI = "mongodb://localhost:27017/urlShortener";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.log("MongoDB 연결 오류:", err));

// Mongoose 모델 생성
const Url = mongoose.model(
  "Url",
  new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
  })
);

// JSON 요청 바디 파싱
app.use(express.json());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "")));

// POST /shorten - 단축 URL 생성
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl || !/^https?:\/\//.test(originalUrl)) {
    return res.status(400).json({ error: "유효한 URL을 입력해주세요." });
  }

  // 이미 단축된 URL이 있는지 확인
  let url = await Url.findOne({ originalUrl });

  if (!url) {
    // 새 URL 생성
    const shortId = nanoid(6);
    url = new Url({ originalUrl, shortId });
    await url.save();
  }

  const shortUrl = `${req.protocol}://${req.get("host")}/${url.shortId}`;
  res.json({ originalUrl, shortUrl });
});

// GET /:shortId - 리다이렉트
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const url = await Url.findOne({ shortId });

  if (url) {
    res.redirect(url.originalUrl);
  } else {
    res.status(404).send("존재하지 않는 단축 URL입니다.");
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
