// 메인 대시보드 + 크루 등록/인증/워크스페이스 진입
function renderMainDashboard() {
    const container = document.getElementById('main-crew-list');
    container.innerHTML = "";

    if(cachedCrewUsers.length === 0) {
        container.innerHTML = `<p class="text-center py-6 font-bold text-slate-400 text-xs">참여 중인 크루 멤버가 없습니다. 아래 버튼으로 추가해 보세요!</p>`;
        return;
    }

    cachedCrewUsers.forEach(user => {
        const dates = [
            { label: "어제", str: shiftDateStr(TODAY_BASE_STR, -1), style: "opacity-50 scale-98" },
            { label: "오늘", str: TODAY_BASE_STR, style: "ring-2 ring-theme-orange border-theme-orange shadow-md relative z-10 bg-orange-50/20" },
            { label: "내일", str: shiftDateStr(TODAY_BASE_STR, 1), style: "opacity-40 scale-95" }
        ];

        const userCats = cachedStudyCategories.filter(c => c.user_id === user.id);
        let closestDDayText = "설정된 목표 시험 없음";
        let minDays = Infinity;

        userCats.forEach(c => {
            if (c.exam_date) {
                const target = new Date(c.exam_date + "T00:00:00");
                const today = new Date(TODAY_BASE_STR + "T00:00:00");
                const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
                if (diff >= 0 && diff < minDays) {
                    minDays = diff;
                    closestDDayText = `🔥 ${c.name} [${diff === 0 ? 'D-Day' : 'D-' + diff}]`;
                }
            }
        });

        let timelineBlocksHtml = "";
        let todayProgressHtml = "";

        dates.forEach(d => {
            const log = cachedLifeLogs.find(l => l.user_id === user.id && l.log_date === d.str);
            let todos = log ? log.study_todos || [] : [];
            let schedules = log ? log.schedules || [] : [];

            if (d.str === TODAY_BASE_STR) {
                const totalCount = todos.length;
                const checkedCount = todos.filter(t => t.checked).length;
                const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
                todayProgressHtml = `
                    <div class="mt-2 w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div class="bg-theme-orange h-2.5 rounded-full transition-all" style="width: ${percent}%"></div>
                    </div>
                    <span class="text-[11px] text-theme-orange font-black mt-1 block">오늘 과제 완수율: ${percent}% (${checkedCount}/${totalCount})</span>
                `;
            }

            let itemRows = "";
            todos.forEach(t => {
                itemRows += `
                    <div class="truncate text-[10px] font-bold ${t.checked ? 'text-slate-400 line-through' : 'text-slate-700'}">
                        ${t.checked ? '✅' : '🍊'} [${t.category}] ${t.label}
                    </div>
                `;
            });
            schedules.forEach(s => {
                itemRows += `<div class="truncate text-[10px] font-extrabold text-indigo-700">📌 [일정] ${s}</div>`;
            });

            if (itemRows === "") {
                itemRows = `<p class="text-[10px] italic text-slate-400">공부 & 일정 내역 없음</p>`;
            }

            timelineBlocksHtml += `
                <div class="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs ${d.style}">
                    <div class="flex justify-between items-center border-b pb-1 mb-1.5 border-slate-100">
                        <span class="text-[11px] font-black text-slate-800">${d.label} (${d.str.slice(5)})</span>
                    </div>
                    <div class="space-y-1 overflow-hidden max-h-24 no-scrollbar">${itemRows}</div>
                </div>
            `;
        });

        // 누적 연동 추정 자산 계산
        const userLogs = cachedLifeLogs.filter(l => l.user_id === user.id);
        let totalSpend = 0;
        userLogs.forEach(l => {
            if(l.spends) l.spends.forEach(s => totalSpend += (s.cost || 0));
        });
        let salaryTotal = 0;
        if(user.salaries) {
            Object.values(user.salaries).forEach(amt => salaryTotal += parseInt(amt || 0));
        }
        const liveAsset = (user.base_asset || 0) + salaryTotal - totalSpend;

        const card = document.createElement('div');
        card.className = "bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-theme-orange transition";
        card.innerHTML = `
            <div class="flex flex-col lg:flex-row gap-6">
                <div class="lg:w-1/4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-4">
                    <div onclick="triggerPasswordAuth(${user.id})" class="cursor-pointer group">
                        <span class="text-[9px] bg-[#1b4d4f] text-white font-black px-2 py-0.5 rounded-sm">CREW MEMBER</span>
                        <h2 class="text-xl font-black text-slate-800 mt-2 group-hover:text-theme-orange flex items-center gap-2">
                            ${user.name} <i class="fa-solid fa-right-to-bracket text-sm opacity-50 group-hover:opacity-100"></i>
                        </h2>
                        <p class="text-[11px] text-slate-500 font-semibold mt-1 italic">목표: ${user.goals && user.goals[0] ? user.goals[0] : '새로운 라이프 크루 목표 수립'}</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-100/70 space-y-2">
                        <div class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <span class="text-base">🎯</span> <span class="text-slate-400 font-medium">가장 임박한 시험:</span> <span class="font-black text-rose-600">${closestDDayText}</span>
                        </div>
                        ${todayProgressHtml}
                    </div>
                </div>
                <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    ${timelineBlocksHtml}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function handleCreateFriend(e) {
    e.preventDefault();
    const nameInput = document.getElementById('add-friend-name');
    const pwdInput = document.getElementById('add-friend-password');
    const name = nameInput.value.trim();
    const password = pwdInput.value;

    if(!name || !password) return;

    const { error } = await sb
        .from('crew_users')
        .insert([{ name, password, goals: ["새로운 라이프 크루 목표 수립"], base_asset: 0, salaries: {} }]);

    if (error) {
        alert("회원 등록 오류 (이미 존재하는 이름 등): " + error.message);
        return;
    }

    nameInput.value = ""; pwdInput.value = "";
    closeModal('modal-add-friend');
    await refreshAllServerData();
}

function triggerPasswordAuth(userId) {
    document.getElementById('input-auth-user-id').value = userId;
    document.getElementById('input-crew-pwd').value = "";
    openModal('modal-password-auth');
}

function handlePasswordSubmit(e) {
    e.preventDefault();
    const uid = parseInt(document.getElementById('input-auth-user-id').value);
    const pwd = document.getElementById('input-crew-pwd').value;
    const targetUser = cachedCrewUsers.find(u => u.id === uid);

    if(targetUser && targetUser.password === pwd) {
        closeModal('modal-password-auth');
        enterPersonalWorkspace(uid);
    } else {
        alert("보안인증 실패: 패스워드가 다릅니다.");
    }
}

function enterPersonalWorkspace(userId) {
    currentActiveUserId = userId;
    const user = cachedCrewUsers.find(u => u.id === userId);
    document.getElementById('workspace-user-title').innerText = user.name;

    document.getElementById('page-main-dashboard').classList.add('hidden');
    document.getElementById('page-personal-workspace').classList.remove('hidden');

    switchTab('tab-calendar');
}

function goToMainDashboard() {
    currentActiveUserId = null;
    document.getElementById('page-personal-workspace').classList.add('hidden');
    document.getElementById('page-main-dashboard').classList.remove('hidden');
    refreshAllServerData();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');

    const tabIdsInfo = ['tab-calendar', 'tab-study', 'tab-diet', 'tab-schedule-etc', 'tab-account'];
    tabIdsInfo.forEach(t => {
        const btn = document.getElementById(`btn-${t}`);
        if(!btn) return;
        if (t === tabId) btn.className = "w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl bg-theme-orange text-white text-left shadow-sm";
        else btn.className = "w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl hover:bg-[#245d60] transition-all text-slate-300 text-left";
    });

    if (tabId === 'tab-calendar') renderCalendarMaster();
    else if (tabId === 'tab-study') loadStudyTabPlan();
    else if (tabId === 'tab-diet') loadDietTabAnalysis();
    else if (tabId === 'tab-schedule-etc') loadEtcScheduleTabMaster();
    else if (tabId === 'tab-account') loadAccountTabLedger();
}
