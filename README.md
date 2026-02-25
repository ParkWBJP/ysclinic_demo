# YS Clinic Rebuild (WordPress XML 기반)

WordPress WXR(`yj.WordPress.2026-02-25.xml`)를 콘텐츠 소스로 사용해, URL 구조를 유지한 신규 클리닉 사이트입니다.

이번 버전은 `JP/KO 다국어 UI`, `프리미엄 메디컬 디자인`, `placeholder 이미지 시스템`을 포함합니다.

## 1) 실행 방법
```bash
npm install
npm run dev
```

프로덕션 빌드:
```bash
npm run build
npm run start
```

## 2) XML 파싱
- 입력 파일 기본 경로: `data/source/yj.WordPress.2026-02-25.xml`
- 파싱 실행:
```bash
npm run parse:xml
```

생성 결과:
- 콘텐츠 데이터: `src/data/site-content.generated.json`
- 분석 문서: `docs/xml-analysis.md`
- URL 매핑표: `docs/url-mapping.md`

## 3) 프로젝트 구조
```text
ysclinic/
  public/placeholders/                    # 교체 가능한 placeholder SVG 이미지
  data/source/                          # 원본 WXR XML
  docs/
    xml-analysis.md                     # page/post/attachment + 메뉴 추정
    url-mapping.md                      # 기존 slug/path -> 렌더 컴포넌트
  scripts/
    parse-wxr.ts                        # XML 파서 + cleaning + 매핑 문서 생성
  src/
    app/
      [locale]/                          # /ja/*, /ko/* 다국어 라우팅
      globals.css
      layout.tsx
      not-found.tsx
      page.tsx                          # / -> /ja/ redirect
    components/
      home/HomeLanding.tsx              # 메인 랜딩
      layout/                           # Header / Footer / Sticky CTA
      pages/ContentPage.tsx             # 일반/시술/포스트/placeholder 템플릿
    data/
      site-content.generated.json       # 파싱 결과
      placeholder-images.ts             # 이미지 placeholder 경로/alt 관리
    i18n/
      messages/ja.json                  # 일본어 UI 텍스트
      messages/ko.json                  # 한국어 UI 텍스트
      index.ts
    lib/
      content.ts                        # 콘텐츠 조회/경로 매핑
      routing.ts                        # locale prefix 라우팅 헬퍼
      types.ts
  middleware.ts                         # non-locale URL -> /ja/* redirect
```

## 4) 콘텐츠 처리 규칙
- Gutenberg 주석(`<!-- wp:... -->`) 제거
- shortcode(대표 패턴) 제거
- 불필요 태그(`script/style/iframe/form`) 제거
- 내부 링크는 기존 도메인 기준 상대 경로로 정리
- 이미지 `alt`가 비어 있으면 첨부파일 메타/파일명 기반으로 기본값 부여
- 본문이 비어 있는 URL은 `placeholder` 템플릿으로 유지

## 5) URL/메뉴 유지 정책
- 경로 기준으로 기존 URL slug를 그대로 라우팅 (`/[locale]/[...slug]`)
- `wp_navigation`의 `page-list` 구조 + publish page 목록으로 메뉴 추정
- 메뉴에 있는 URL은 누락 없이 생성, 누락 시 placeholder 자동 생성
- 다국어 URL prefix:
  - 일본어: `/ja/...`
  - 한국어: `/ko/...`
- 기존 prefix 없는 URL은 `middleware`에서 `/ja/...`로 자동 리다이렉트

## 6) 수정 포인트
- 디자인: `src/app/globals.css`
- 헤더/푸터/고정 CTA: `src/components/layout/*`
- 홈 랜딩 섹션: `src/components/home/HomeLanding.tsx`
- 서브 페이지 템플릿: `src/components/pages/ContentPage.tsx`
- 파싱/클리닝 로직: `scripts/parse-wxr.ts`
- 다국어 UI 문구: `src/i18n/messages/ja.json`, `src/i18n/messages/ko.json`

## 7) 폰트 목록 및 적용 위치
- `Noto Serif JP`: 일본어 제목(h1~h4)
- `Noto Sans JP`: 일본어 본문/버튼/메뉴
- `Noto Serif KR`: 한국어 제목(h1~h4)
- `Noto Sans KR`: 한국어 본문/버튼/메뉴
- 설정 위치: `src/app/layout.tsx`, `src/app/globals.css`

## 8) Placeholder 이미지 교체 방법
1. `public/placeholders/` 안의 SVG를 실제 이미지로 교체 (동일 파일명 권장)
2. 파일명을 바꾸는 경우 `src/data/placeholder-images.ts`의 `src` 경로 수정
3. alt 텍스트는 `placeholder-images.ts`에서 언어별(`ja`, `ko`)로 관리
4. 페이지별 사용 위치:
   - Hero: `hero-clinic.svg`
   - 프로그램 카드: `treatment-card.svg`
   - 의료진: `doctor-portrait.svg`
   - 시설/섹션: `facility-lounge.svg`, `facility-detail.svg`
   - FAQ/CTA 배너: `faq-banner.svg`, `cta-banner.svg`

## 9) 다국어 텍스트 관리 구조
- UI 문자열은 JSON 분리:
  - `src/i18n/messages/ja.json`
  - `src/i18n/messages/ko.json`
- 공통 로더: `src/i18n/index.ts`
- 확장 방식(EN 추가 예시):
  1. `src/i18n/messages/en.json` 생성
  2. `SUPPORTED_LOCALES`에 `en` 추가
  3. `getMessages` 맵에 등록

## 10) 참고
- 현재 XML 기준으로 `publish page 46`, `publish post 1`, `attachment 252`를 반영합니다.
- 콘텐츠가 비어 있는 페이지(예: `/初めての方へ/`)는 placeholder 섹션으로 제공됩니다.
