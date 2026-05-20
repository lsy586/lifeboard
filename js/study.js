// 공부 계획 & 디데이 탭
function toggleStudyAddForm() {
    const el = document.getElementById('form-study-category-add');
    el.classList.toggle('hidden');
}

function openStudyCategoryEdit(catId) {
    const cat = cachedStudyCategories.find(c => c.id === catId);
    if (!cat) return;

    document.getElementById('form-study-category-add').classList.add('hidden');
    document.getElementById('form-study-category-edit').classList.remove('hidden');
    document.getElementById('study-edit-title').innerText = `${cat.name} 수정`;
    document.getElementById('input-edit-study-cat-id').value = cat.id;
    document.getElementById('input-edit-study-cat').value = cat.name;
    document.getElementById('input-edit-study-exam-date').value = cat.exam_date || "";
}

function closeStudyEditForm() {
    document.getElementById('form-study-category-edit').classList.add('hidden');
}

async function submitStudyCategoryEdit(e) {
    e.preventDefault();
    const id = document.getElementById('input-edit-study-cat-id').value;
    const name = document.getElementById('input-edit-study-cat').value.trim();
    const exam_date = document.getElementById('input-edit-study-exam-date').value || null;
    if (!id || !name) return;

    const { error } = await sb
        .from('study_categories')
        .update({ name, exam_date })
        .eq('id', id);

    if (error) {
        alert("수정 실패: " + error.message);
        return;
    }

    closeStudyEditForm();
    await refreshAllServerData();
    loadStudyTabPlan();
}

async function deleteStudyCategory() {
    const id = document.getElementById('input-edit-study-cat-id').value;
    const name = document.getElementById('input-edit-study-cat').value.trim();
    if (!id) return;
    if (!confirm(`'${name}' 과목을 삭제할까요?`)) return;

    const { error } = await sb
        .from('study_categories')
        .delete()
        .eq('id', id);

    if (error) {
        alert("삭제 실패: " + error.message);
        return;
    }

    closeStudyEditForm();
    await refreshAllServerData();
    loadStudyTabPlan();
}

async function addStudyCategoryCustom(e) {
    e.preventDefault();
    const catInput = document.getElementById('input-new-study-cat');
    const dateInput = document.getElementById('input-new-study-exam-date');
    const name = catInput.value.trim();
    const exam_date = dateInput.value || null;

    if (!name) return;

    const { error } = await sb
        .from('study_categories')
        .insert([{ user_id: currentActiveUserId, name, exam_date }]);

    if (error) {
        alert("과목 등록 실패 (중복명 확인): " + error.message);
        return;
    }

    catInput.value = ""; dateInput.value = "";
    toggleStudyAddForm();
    await refreshAllServerData();
    loadStudyTabPlan();
}

function loadStudyTabPlan() {
    const tagContainer = document.getElementById('study-category-tags-container');
    tagContainer.innerHTML = "";
    const dropdown = document.getElementById('select-study-category-dropdown');
    dropdown.innerHTML = "";

    const myCats = cachedStudyCategories.filter(c => c.user_id === currentActiveUserId);

    if (myCats.length === 0) {
        tagContainer.innerHTML = `<span class="text-xs text-slate-400 italic">등록된 과목 속성이 없습니다.</span>`;
        dropdown.innerHTML = `<option value="">등록 과목 없음</option>`;
    } else {
        myCats.forEach(c => {
            const badgeStr = c.exam_date ? calculateDDay(c.exam_date) : "상시";
            const span = document.createElement('span');
            span.className = "inline-flex items-center bg-theme-cream border border-orange-200 text-theme-orange text-xs font-black px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer hover:bg-orange-100 transition";
            span.title = "클릭하여 수정";
            span.innerHTML = `📚 ${c.name} <span class="ml-1.5 px-1.5 py-0.5 text-[9px] bg-amber-500 text-white rounded">${badgeStr}</span>`;
            span.onclick = () => openStudyCategoryEdit(c.id);
            tagContainer.appendChild(span);

            const opt = document.createElement('option');
            opt.value = c.name; opt.innerText = c.name;
            dropdown.appendChild(opt);
        });
    }

    renderStudyMiniCalendar();
    renderStudySelectedDateLabel();
}

function renderStudyMiniCalendar() {
    const grid = document.getElementById('study-mini-calendar-grid');
    grid.innerHTML = "";
    const days = getMonthDaysInfo(viewYear, viewMonth);

    days.forEach(d => {
        const div = document.createElement('div');
        div.className = `p-1 text-center font-bold text-[10px] rounded-md cursor-pointer ${d.isCurrentMonth ? 'bg-slate-50 hover:bg-orange-100 text-slate-700' : 'text-slate-300 opacity-30'}`;

        if(d.fullDateStr === studyTabSelectedDateStr) {
            div.className += " bg-theme-orange text-white font-black shadow-xs";
        }

        div.innerText = d.dayNum;
        div.onclick = () => {
            studyTabSelectedDateStr = d.fullDateStr;
            renderStudyMiniCalendar();
            renderStudySelectedDateLabel();
        };
        grid.appendChild(div);
    });
}

function renderStudySelectedDateLabel() {
    document.getElementById('study-selected-date-label').innerText = studyTabSelectedDateStr;
    const container = document.getElementById('study-tab-master-list-box');
    container.innerHTML = "";

    const log = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === studyTabSelectedDateStr);
    const todos = log ? log.study_todos || [] : [];

    if(todos.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic py-2">지정 날짜에 공부 가이드 스케줄이 비어있습니다.</p>`;
        return;
    }

    todos.forEach((t, index) => {
        const row = document.createElement('div');
        row.className = "flex justify-between items-center bg-slate-50 border p-2.5 rounded-xl text-xs font-bold";
        row.innerHTML = `
            <div class="flex items-center gap-2 truncate">
                <input type="checkbox" ${t.checked ? 'checked' : ''} onclick="toggleStudyTodoCheck('${studyTabSelectedDateStr}', ${index})" class="accent-orange-600">
                <span class="${t.checked ? 'line-through text-slate-400' : 'text-slate-800'}">[${t.category}] ${t.label}</span>
            </div>
            <button onclick="deleteStudyTodoMaster('${studyTabSelectedDateStr}', ${index})" class="text-slate-300 hover:text-red-500"><i class="fa-solid fa-trash-can"></i></button>
        `;
        container.appendChild(row);
    });
}

async function addStudyTodoFromTab() {
    const catSelect = document.getElementById('select-study-category-dropdown');
    const labelInput = document.getElementById('input-study-todo-text');
    const cat = catSelect.value;
    const label = labelInput.value.trim();

    if(!cat || !label) return;

    const existingLog = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === studyTabSelectedDateStr);
    let currentTodos = existingLog ? existingLog.study_todos || [] : [];

    currentTodos.push({ category: cat, label, checked: false });

    const payload = {
        user_id: currentActiveUserId,
        log_date: studyTabSelectedDateStr,
        study_todos: currentTodos,
        meals: existingLog ? existingLog.meals : { morning: "", lunch: "", dinner: "" }
    };

    const { error } = await sb.from('daily_life_logs').upsert(payload, { onConflict: 'user_id, log_date' });
    if (error) { alert("저장 오류: " + error.message); return; }

    labelInput.value = "";
    await refreshAllServerData();
    renderStudySelectedDateLabel();
}

async function toggleStudyTodoCheck(dateStr, idx) {
    const log = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === dateStr);
    if(!log || !log.study_todos) return;

    log.study_todos[idx].checked = !log.study_todos[idx].checked;

    const { error } = await sb.from('daily_life_logs').upsert(log, { onConflict: 'user_id, log_date' });
    if (error) alert("서버 연동 실패: " + error.message);
    await refreshAllServerData();
    renderStudySelectedDateLabel();
}

async function deleteStudyTodoMaster(dateStr, idx) {
    const log = cachedLifeLogs.find(l => l.user_id === currentActiveUserId && l.log_date === dateStr);
    if(!log || !log.study_todos) return;

    log.study_todos.splice(idx, 1);

    const { error } = await sb.from('daily_life_logs').upsert(log, { onConflict: 'user_id, log_date' });
    if (error) alert("서버 반영 실패: " + error.message);
    await refreshAllServerData();
    renderStudySelectedDateLabel();
}
