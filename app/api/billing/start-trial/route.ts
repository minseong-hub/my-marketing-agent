import { NextResponse } from "next/server";

/**
 * 체험판 흐름은 더 이상 사용자에게 노출되지 않습니다.
 * 라우트는 보안상 폐기 상태로 두되, 의도치 않은 호출을 차단하기 위해 410(Gone)으로 응답합니다.
 */
export async function POST() {
  return NextResponse.json(
    { error: "체험판 기능은 종료되었습니다. 무료 플랜으로 가입 후 사용해 주세요." },
    { status: 410 }
  );
}
