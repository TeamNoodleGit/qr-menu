# qr-menu

## 누들 키친 QR 메뉴판

한국어, 영어, 일본어, 중국어 간체를 지원하는 정적 메뉴판입니다. 기본 언어는 한국어이며 가격은 원화입니다. 예시 메뉴 세 개와 자리 표시용 그림을 실제 메뉴와 사진으로 교체할 수 있습니다.

## PC에서 확인

프로젝트 폴더에서 Python 3의 `py -m http.server 8000`을 실행하고 [로컬 메뉴판](http://localhost:8000/)을 엽니다. 파일을 더블클릭하면 브라우저가 메뉴 데이터 요청을 차단할 수 있습니다.

## GitHub Pages 배포

1. 기존 Public 저장소를 사용할 경우 먼저 복제해 기존 파일과 기록을 확인합니다. 이 프로젝트의 파일을 저장소 최상위에 반영하고 기존 파일과 이름이 겹치면 내용을 비교해 병합합니다. 새 Public 저장소라면 이 폴더의 파일을 첫 커밋에 담습니다. `.pages.yml`과 `.nojekyll`도 포함합니다.
2. 변경을 `main`에 올립니다. GitHub의 **Settings → Pages**에서 **Deploy from a branch**, **main**, **/(root)**를 선택하고 저장합니다.
3. 배포 후 **Visit site**에서 메뉴판을 엽니다. 프로젝트 저장소의 주소는 보통 `https://<owner>.github.io/<repo>/`입니다. 손님용 QR코드에는 실제 **Visit site** 주소를 사용합니다.

[GitHub Pages 배포 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Pages CMS 연결 및 메뉴 편집

1. 저장소 관리자 계정으로 [Pages CMS](https://app.pagescms.org/)에 GitHub 로그인합니다.
2. Pages CMS GitHub App을 해당 계정 또는 조직에 설치하고 편집할 저장소에 접근을 허용합니다. CMS에서 해당 저장소의 `main`을 엽니다.
3. **메뉴판**에서 목록 행을 추가·수정·삭제한 뒤 저장합니다. 네 언어의 메뉴명과 설명, 원화 가격, 카테고리, 품절 여부를 입력합니다. 목록 순서는 각 카테고리의 표시 순서에 반영됩니다.
4. **Media** 또는 메뉴의 이미지 필드에서 사진을 업로드하고 메뉴 항목에 지정합니다. 파일은 `images/`에 저장됩니다. CMS가 생성한 `/images/파일명`은 메뉴판이 저장소 기준 경로로 해석합니다.
5. 저장 뒤 GitHub에 커밋이 생겼는지 확인하고, Pages 배포가 끝나면 공개 메뉴판을 새로고침합니다. 쓰기가 거부되면 `main`의 브랜치 규칙 및 GitHub App 권한을 확인합니다.

[Pages CMS 빠른 시작](https://pagescms.org/docs/quick-start/)

## GitHub 계정이 없는 편집자

2026-11-08 기준 공식 안내는 호스팅형 Pages CMS를 무료로 제공하고, GitHub 계정이 없는 사람을 이메일로 초대해 콘텐츠와 미디어를 편집할 수 있다고 설명합니다. 초대받은 편집자의 변경은 GitHub App 설치 권한으로 저장됩니다. CMS 설정과 초대 관리는 저장소 접근 권한이 있는 GitHub 사용자가 담당합니다. 실제 초대 수락과 이 저장소의 `main` 저장은 연결 후 편집자 계정으로 확인해야 합니다.

[공식 요금 안내](https://pagescms.org/) · [편집자 권한](https://pagescms.org/docs/configuration/collaborators/)

메뉴 원본은 `data/menu.json`입니다. 카테고리 선택지는 `.pages.yml`의 카테고리 필드와 `menu.js`의 카테고리 키 및 네 언어 표시 문구에서 함께 관리합니다.
