# MINEFUN-BRIDGE

Minefun MCP용 Cloudflare Worker 보안 프록시와 모바일 웹 MCP 도구 패널입니다.

## 구성

- `worker/index.js`: 브라우저 요청을 인증된 Minefun MCP 엔드포인트로 전달합니다.
- `index.html`: MCP 초기화, `tools/list`, `tools/call`을 제공하는 모바일 웹 패널입니다.
- `wrangler.toml`: Worker 배포 설정입니다.

## 1. Cloudflare Worker 만들기

1. Cloudflare 대시보드에서 Workers & Pages로 이동합니다.
2. 새 Worker를 만들고 `worker/index.js` 내용을 코드 편집기에 붙여넣어 배포합니다.
3. Worker Settings → Variables and Secrets에서 다음 세 값을 **Secret**으로 등록합니다.

| 이름 | 값 |
|---|---|
| `MINEFUN_MCP_URL` | `https://eu-custom-1.minefun.io/mcp` |
| `MINEFUN_MCP_TOKEN` | Minefun에서 새로 발급한 MCP Bearer 토큰 |
| `BRIDGE_ACCESS_KEY` | 직접 생성한 긴 임의 비밀번호 |

기존 대화에 노출된 토큰은 재사용하지 말고 폐기/재발급하세요. 원본 Minefun 토큰을 HTML이나 GitHub 저장소에 올리지 마세요.

4. Worker를 다시 배포한 뒤 `https://<worker-name>.<account>.workers.dev/health`에 접속해 `configured: true`인지 확인합니다.

## 2. 웹 패널 열기

GitHub Pages를 저장소 Settings → Pages에서 활성화하고 배포가 끝나면 저장소 Pages 주소를 엽니다. 화면에 Worker 주소(`https://...workers.dev/mcp`)와 `BRIDGE_ACCESS_KEY`를 입력한 뒤 **연결 및 도구 불러오기**를 누릅니다.

## 보안 참고

- Worker는 `BRIDGE_ACCESS_KEY` 없이는 MCP 요청을 전달하지 않습니다.
- 브라우저 접근 키는 탭 세션 저장소에만 저장됩니다.
- 현재 CORS는 공개 웹 패널 사용을 위해 전체 Origin을 허용합니다. 접근 키를 강하게 설정하고 공개 배포 전에는 허용 Origin을 실제 Pages 도메인으로 제한하세요.
- 이 프로젝트는 MCP 브리지와 도구 실행 패널입니다. ChatGPT Free 대화창 자체에 사용자 지정 MCP 서버를 등록하는 기능은 아닙니다.
- AI 자연어 에이전트 기능은 별도 AI API 키/서버 측 도구 호출 통합이 필요하며 아직 포함되지 않았습니다.
