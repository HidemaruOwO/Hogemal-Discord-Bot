# Hogemal

ひでまるの開発する便利な Bot

## 技術

- discord.js
- @discordjs/voice
- @discordjs/opus
- moment
- request
- voice-text
- ffmpeg
- ffmpeg-static
- tweetnacl

## 開発時について

開発するときは`data/config.json`の

```json
"developMode": false
```

を `true` にして開発してください

有効にしないと本番の Bot を動かすことになってしまいます

## データの管理について

この Bot はプライベートレポジトリのため流出に気をつけてください

特に以下のファイルは絶対に流出させないように気をつけてください

- `env/`フォルダー下のファイル
- `data/score.json`
- `data/blacklist.json`

## ファイルのコミット時について

`data/config.json`をコミットするときには

```json
"developMode": true
```

を`false`にしてコミットしてください

## コードの書き方の統一

可読性を上げるために予め統一しましょう

| TH               | TH                       |
| ---------------- | ------------------------ |
| 文字列の囲い     | " ダブルクオーテーション |
| 末尾にセミコロン | 付ける                   |
