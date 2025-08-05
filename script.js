document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const workshop = document.getElementById('workshop');
    const outWorkshop = document.getElementById('out-workshop');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const subsectionDropZones = document.querySelectorAll('.subsection-drop-zone');
    const allDropZones = [waitingWorkshop, outWorkshop, ...Array.from(subsectionDropZones), workshop];

    let draggedItem = null;
    let unitCount = 0;

    // دالة للتحقق مما إذا كان الجهاز يدعم اللمس
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    // دالة لفرز الوحدات أبجديًا
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

    // دالة مساعدة لتحديث لون الوحدة بناءً على منطقة الإسقاط
    function updateUnitColor(unit, dropZoneElement) {
        if (dropZoneElement.id === 'out-workshop') {
            unit.style.backgroundColor = 'var(--danger-red)';
        } else if (dropZoneElement.id === 'waiting-workshop') {
            unit.style.backgroundColor = 'var(--accent-orange)';
        } else {
            unit.style.backgroundColor = 'var(--primary-blue)';
        }
    }

    // دالة لمعالجة إفلات الوحدة
    function dropItem(targetDropZone) {
        if (draggedItem && draggedItem.parentElement !== targetDropZone) {
            if (draggedItem.parentElement) {
                draggedItem.parentElement.removeChild(draggedItem);
            }
            targetDropZone.appendChild(draggedItem);
            updateUnitColor(draggedItem, targetDropZone);
            sortUnitsAlphabetically(targetDropZone);
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
    }

    // تهيئة مناطق الإسقاط لمنطق الماوس
    function setupMouseDropZones() {
        allDropZones.forEach(element => {
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
                if (draggedItem && draggedItem.parentElement !== element) {
                    dropItem(element);
                }
            });
        });
    }

    // تهيئة مناطق الإسقاط لمنطق اللمس
    function setupTouchDropZones() {
        allDropZones.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                if (draggedItem) {
                    e.preventDefault(); // منع سلوك التمرير
                    e.stopPropagation(); // منع انتقال الحدث
                    // تحديد منطقة الإسقاط من اللمسة
                    const dropTarget = e.target.closest('.drop-zone, .subsection-drop-zone');
                    if (dropTarget) {
                        dropItem(dropTarget);
                    }
                }
            });
        });
    }
    
    // دالة إنشاء وحدة جديدة
    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`;
        
        // إذا كان الجهاز يدعم اللمس، لا تجعل draggable=true لتجنب التعارض
        if (isTouchDevice()) {
            newUnit.draggable = false;
        } else {
            newUnit.draggable = true;
        }

        // منطق السحب بالماوس
        if (!isTouchDevice()) {
            newUnit.addEventListener('dragstart', (e) => {
                draggedItem = newUnit;
                e.dataTransfer.setData('text/plain', '');
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => newUnit.classList.add('dragging'), 0);
            });
            newUnit.addEventListener('dragend', () => {
                newUnit.classList.remove('dragging');
                draggedItem = null;
            });
        }
        
        // منطق السحب باللمس (polyfill)
        if (isTouchDevice()) {
            let startX, startY;

            newUnit.addEventListener('touchstart', (e) => {
                draggedItem = newUnit;
                draggedItem.classList.add('dragging');
                // حفظ موقع اللمس الأولي
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
            });

            newUnit.addEventListener('touchmove', (e) => {
                if (draggedItem) {
                    e.preventDefault(); // منع التمرير
                    const touch = e.touches[0];
                    const diffX = touch.clientX - startX;
                    const diffY = touch.clientY - startY;

                    // هنا يمكنك إعطاء تغذية بصرية للعنصر المسحوب إذا أردت
                    // على سبيل المثال، تحريكه يدوياً
                    // draggedItem.style.transform = `translate(${diffX}px, ${diffY}px)`;
                }
            });

            newUnit.addEventListener('touchend', (e) => {
                if (draggedItem) {
                    const touch = e.changedTouches[0];
                    const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);
                    
                    if (dropZone) {
                        const targetZone = dropZone.closest('.drop-zone, .subsection-drop-zone');
                        if (targetZone) {
                            dropItem(targetZone);
                        } else {
                            draggedItem.classList.remove('dragging');
                            draggedItem = null;
                        }
                    }
                }
            });
        }
        
        // دبل كليك لتعديل النص
        newUnit.addEventListener('dblclick', (e) => {
            const currentText = newUnit.textContent;
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText;
            inputField.className = 'edit-unit-input';
            newUnit.textContent = '';
            newUnit.appendChild(inputField);
            inputField.focus();

            const saveChanges = () => {
                newUnit.textContent = inputField.value.trim() || currentText;
                if (newUnit.contains(inputField)) {
                    newUnit.removeChild(inputField);
                }
                sortUnitsAlphabetically(newUnit.parentElement);
            };

            inputField.addEventListener('blur', saveChanges);
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveChanges();
                    inputField.blur();
                }
            });
        });

        waitingWorkshop.appendChild(newUnit); 
        updateUnitColor(newUnit, waitingWorkshop);
    }
    
    // زر الإضافة
    addUnitButton.addEventListener('click', () => createDraggableUnit());

    // إضافة المربعات الأولية
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
    
    // الفرز النهائي بعد إضافة جميع المربعات
    sortUnitsAlphabetically(waitingWorkshop);
    
    // تهيئة مناطق الإسقاط بناءً على نوع الجهاز
    if (isTouchDevice()) {
        setupTouchDropZones();
    } else {
        setupMouseDropZones();
    }
});
