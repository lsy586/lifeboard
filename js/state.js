// 전역 상태 변수 및 캐시
let currentActiveUserId = null;
let currentSelectedDateStr = "";
let currentCalendarMode = "month";
let currentSelectedWeekNum = 1;
let viewYear = (new Date()).getFullYear();
let viewMonth = (new Date()).getMonth() + 1;
let pendingInlineTodos = [];
let pendingInlineSchedules = [];
let pendingInlineWorkouts = [];
let pendingInlineSpends = [];
let studyTabSelectedDateStr = TODAY_BASE_STR;
let inlineEditorIsEditMode = false;
let globalWeightChartInstance = null;

// 로컬 데이터 캐싱 객체
let cachedCrewUsers = [];
let cachedStudyCategories = [];
let cachedLifeLogs = [];
