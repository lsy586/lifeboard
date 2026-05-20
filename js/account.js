// 가계부 자산관리 탭
function loadAccountTabLedger() {
    const user = cachedCrewUsers.find(u => u.id === currentActiveUserId);
    if(!user) return;

    document.getElementById('input-asset-base').value = user.base_asset || 0;

    const tbody = document.getElementById('acc-tab-table-body');
    tbody.innerHTML = "";

    const myLogs = cachedLifeLogs.filter(l => l.user_id === currentActiveUserId && l.spends && l.spends.length > 0);
    let totalSpend = 0;

    myLogs.forEach(log => {
        log.spends.forEach((s, idx) => {
            totalSpend += s.cost;
            const tr = document.createElement('tr');
            tr.className = "border-b border-slate-100 hover:bg-slate-50/50";
            tr.innerHTML = `
                <td class="p-2">${log.log_date}</td>
                <td class="p-2">${s.memo}</td>
                <td class="p-2 text-rose-600 font-bold">-${s.cost.toLocaleString()}원</td>
                <td class="p-2"><button onclick="deleteAccountSpendFromTabMaster('${log.log_date}', ${idx})" class="text-slate-300 hover:text-red-500"><i class="fa-solid fa-trash-can"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    });

    let salaryTotal = 0;
    if (user.salaries) {
        Object.values(user.salaries).forEach(v => salaryTotal += parseInt(v || 0));
    }

    const liveAsset = (user.base_asset || 0) + salaryTotal - totalSpend;
    document.getElementById('label-total-asset').innerText = `${liveAsset.toLocaleString()}원`;
}

async function saveBaseAsset() {
    const amt = parseInt(document.getElementById('input-asset-base').value) || 0;
    const { error } = await sb.from('crew_users').update({ base_asset: amt }).eq('id', currentActiveUserId);
    if (error) alert("자산 설정 실패: " + error.message);

    await refreshAllServerData();
    loadAccountTabLedger();
}

async function addSalary() {
    const m = document.getElementById('input-salary-month').value;
    const amt = parseInt(document.getElementById('input-salary-amount').value) || 0;

    const user = cachedCrewUsers.find(u => u.id === currentActiveUserId);
    let currentSalaries = user.salaries || {};
    currentSalaries[m] = amt;

    const { error } = await sb.from('crew_users').update({ salaries: currentSalaries }).eq('id', currentActiveUserId);
    if(error) alert("정산 처리 에러: " + error.message);

    document.getElementById('input-salary-amount').value = "";
    await refreshAllServerData();
    loadAccountTabLedger();
}

async function addAccountSpendFromTab() {
    const dInput = document.getElementById('input-tab-acc-date');
    const tInput = document.getElementById('input-tab-acc-text');
    const aInput = document.getElementById('input-tab-acc-amount');

    const dateStr = dInput.value;
    const memo = tInput.value.trim();
    const cost = parseInt(aInput.value) || 0;

    if(!dateStr || !memo || !cost) return;

    const existingLog = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === dateStr);
    let currentSpends = existingLog ? existingLog.spends || [] : [];
    currentSpends.push({ memo, cost });

    const payload = {
        user_id: currentActiveUserId,
        log_date: dateStr,
        spends: currentSpends,
        meals: existingLog ? existingLog.meals : { morning: "", lunch: "", dinner: "" }
    };

    const { error } = await sb.from('daily_life_logs').upsert(payload, { onConflict: 'user_id, log_date' });
    if (error) alert("가계부 동기화 실패: " + error.message);

    tInput.value = ""; aInput.value = "";
    await refreshAllServerData();
    loadAccountTabLedger();
}

async function deleteAccountSpendFromTabMaster(dateStr, idx) {
    const log = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === dateStr);
    if(!log || !log.spends) return;

    log.spends.splice(idx, 1);

    const { error } = await sb.from('daily_life_logs').upsert(log, { onConflict: 'user_id, log_date' });
    if(error) alert("서버 가계부 삭감 에러: " + error.message);

    await refreshAllServerData();
    loadAccountTabLedger();
}
