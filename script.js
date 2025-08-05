document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const allDropZones = document.querySelectorAll('.drop-zone, .subsection-drop-zone');
    const unitSearch = document.getElementById('unitSearch');
    const clearSearch = document.getElementById('clearSearch');
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    
    const waitingCount = document.getElementById('waiting-count');
    const workshopCount = document.getElementById('workshop-count');
    const outCount = document.getElementById('out-count');

    let draggedItem = null;
    let unitCount = 0;
    let targetDropZoneForConfirm = null;

    // تحميل البيانات المحفوظة
    function loadData() {
        const savedData = localStorage.getItem('workshopUnitsData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // مسح الوحدات الحالية
            document.querySelectorAll('.draggable-unit').forEach(u => u.remove());
            
            // إعادة إنشاء الوحدات من البيانات المحفوظة
            data.waiting.forEach(text => createDraggableUnit(text));
            data.workshop.forEach(item => {
                const unit = createDraggableUnit(item.text);
                const section = document.getElementById(item.section);
                if (section) {
                    section.appendChild(unit);
                    updateUnitColor(unit, section);
                }
            });
            data.out.forEach(text => {
                const unit = createDraggableUnit(text);
                document.getElementById('out-workshop').appendChild(unit);
                updateUnitColor(unit, document.getElementById('out-workshop'));
            });
            unitCount = data.waiting.length + data.workshop.length + data.out.length;
        } else {
            // تهيئة وحدات افتراضية إذا لم تكن هناك بيانات محفوظة
            const totalInitialUnits = 236;
            const numberedUnitsStart = 3001;
            const numberedUnitsEnd = 3221;

            for (let i = 0; i < totalInitialUnits; i++) {
                let unitText;
                if (i < (numberedUnitsEnd - numberedUnitsStart + 1)) {
                    unitText = `${numberedUnitsStart + i}`;
                } else {
                    unitText = `وحدة رقم ${unitCount + 1}`;
                    unitCount++;
                }
                createDraggableUnit(unitText);
            }
        }
        updateStats();
        sortAllZones();
    }

    // حفظ البيانات
    function saveData() {
        const data = {
            waiting: Array.from(waitingWorkshop.querySelectorAll('.draggable-unit')).map(u => u.textContent),
            workshop: Array.from(document.getElementById('workshop').querySelectorAll('.draggable-unit')).map(u => ({
                text: u.textContent,
                section: u.parentElement.id
            })),
            out: Array.from(document.getElementById('out-workshop').querySelectorAll('.draggable-unit')).map(u => u.textContent)
        };
        localStorage.setItem('workshopUnitsData', JSON.stringify(data));
    }

    // فرز الوحدات أبجديًا
    function sortUnitsAlphabetically(container) {
        const units = Array.from(container.querySelectorAll('.draggable-unit'));
        units.sort((a, b) => {
            const textA = a.textContent.trim().toLowerCase();
            const textB = b.textContent.trim().toLowerCase();
            return textA.localeCompare(textB, 'ar', { sensitivity: 'base' });
        });
        units.forEach(unit => {
            container.appendChild(unit);
        });
    }

    // فرز جميع المناطق
    function sortAllZones() {
        allDropZones.forEach(zone => sortUnitsAlphabetically(zone));
    }

    // تحديث إحصائيات الوحدات
    function updateStats() {
        waitingCount.textContent = waitingWorkshop.querySelectorAll('.draggable-unit').length;
        workshopCount.textContent = document.getElementById('workshop').querySelectorAll('.draggable-unit').length;
        outCount.textContent = document.getElementById('out-workshop').querySelectorAll('.draggable-unit').length;
    }

    // تحديث لون الوحدة حسب المنطقة
    function updateUnitColor(unit, dropZoneElement) {
        if (dropZoneElement.id === 'out-workshop') {
            unit.style.backgroundColor = 'var(--danger-red)';
        } else if (dropZoneElement.id === 'waiting-workshop') {
            unit.style.backgroundColor = 'var(--accent-orange)';
        } else {
            unit.style.backgroundColor = 'var(--primary-blue)';
        }
    }

    // معالجة الإفلات
    function handleDrop(targetDropZone) {
        if (!draggedItem || !targetDropZone) return;
        
        // إذا كانت المنطقة الهدف هي خارج الورشة، نطلب التأكيد
        if (targetDropZone.id === 'out-workshop' && draggedItem.parentElement.id !== 'out-workshop') {
            targetDropZoneForConfirm = targetDropZone;
            confirmDialog.showModal();
            return;
        }
        
        // إذا كانت المنطقة الهدف مختلفة عن المنطقة الحالية للوحدة
        if (draggedItem.parentElement !== targetDropZone) {
            targetDropZone.appendChild(draggedItem);
            updateUnitColor(draggedItem, targetDropZone);
            sortUnitsAlphabetically(targetDropZone);
            updateStats();
            saveData();
        }
        
        resetDraggedItem();
    }

    // إعادة تعيين العنصر المسحوب
    function resetDraggedItem() {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem.style.removeProperty('position');
            draggedItem.style.removeProperty('top');
            draggedItem.style.removeProperty('left');
            draggedItem.style.removeProperty('z-index');
            draggedItem.style.removeProperty('opacity');
            draggedItem.style.removeProperty('transform');
            draggedItem = null;
        }
        document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));
    }

    // إنشاء وحدة قابلة للسحب
    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`;
        newUnit.draggable = true;

        // حدث بدء السحب
        newUnit.addEventListener('dragstart', (e) => {
            draggedItem = newUnit;
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => newUnit.classList.add('dragging'), 0);
        });

        // حدث انتهاء السحب
        newUnit.addEventListener('dragend', resetDraggedItem);

        // حدث النقر المزدوج للتعديل
        newUnit.addEventListener('dblclick', (e) => {
            const currentText = newUnit.textContent;
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText;
            inputField.className = 'edit-unit-input';
            e.stopPropagation();

            newUnit.textContent = '';
            newUnit.appendChild(inputField);
            inputField.focus();

            const saveChanges = () => {
                newUnit.textContent = inputField.value.trim() || currentText;
                if (newUnit.contains(inputField)) {
                    newUnit.removeChild(inputField);
                }
                sortUnitsAlphabetically(newUnit.parentElement);
                saveData();
            };

            inputField.addEventListener('blur', saveChanges);
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveChanges();
                    inputField.blur();
                }
            });
        });

        // حدث الضغط المطول للحذف (لأجهزة اللمس)
        let longPressTimer;
        newUnit.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                e.preventDefault();
                showDeleteConfirmation(newUnit);
            }, 1000);
        });

        newUnit.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });

        waitingWorkshop.appendChild(newUnit);
        updateUnitColor(newUnit, waitingWorkshop);
        updateStats();
        return newUnit;
    }

    // عرض تأكيد الحذف
    function showDeleteConfirmation(unit) {
        draggedItem = unit;
        targetDropZoneForConfirm = document.getElementById('out-workshop');
        confirmDialog.showModal();
    }

    // تهيئة مناطق الإسقاط
    allDropZones.forEach(element => {
        // أحداث السحب للماوس
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', () => {
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            handleDrop(element);
        });

        // أحداث النقر لللمس
        element.addEventListener('click', () => {
            if (draggedItem) {
                handleDrop(element);
            }
        });
    });

    // أحداث البحث
    unitSearch.addEventListener('input', () => {
        const searchTerm = unitSearch.value.trim().toLowerCase();
        document.querySelectorAll('.draggable-unit').forEach(unit => {
            const unitText = unit.textContent.toLowerCase();
            unit.style.display = unitText.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    clearSearch.addEventListener('click', () => {
        unitSearch.value = '';
        document.querySelectorAll('.draggable-unit').forEach(unit => {
            unit.style.display = 'flex';
        });
    });

    // أحداث حوار التأكيد
    confirmYes.addEventListener('click', () => {
        if (draggedItem && targetDropZoneForConfirm) {
            targetDropZoneForConfirm.appendChild(draggedItem);
            updateUnitColor(draggedItem, targetDropZoneForConfirm);
            sortUnitsAlphabetically(targetDropZoneForConfirm);
            updateStats();
            saveData();
        }
        confirmDialog.close();
        resetDraggedItem();
    });

    confirmNo.addEventListener('click', () => {
        confirmDialog.close();
        resetDraggedItem();
    });

    // تهيئة التطبيق
    addUnitButton.addEventListener('click', () => {
        createDraggableUnit();
        saveData();
    });

    // تحميل البيانات عند البدء
    loadData();
});
