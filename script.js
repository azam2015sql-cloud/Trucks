document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const workshop = document.getElementById('workshop');
    const outWorkshop = document.getElementById('out-workshop');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const subsectionDropZones = document.querySelectorAll('.subsection-drop-zone');
    const allDropZones = [waitingWorkshop, outWorkshop, ...Array.from(subsectionDropZones), workshop];

    let draggedItem = null;
    let unitCount = 0;
    
    // متغيرات لمنطق اللمس اليدوي
    let activeTouch = null;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

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
            targetDropZone.appendChild(draggedItem);
            updateUnitColor(draggedItem, targetDropZone);
            sortUnitsAlphabetically(targetDropZone);
        }
    }

    // تهيئة مناطق الإسقاط
    function setupDropZones() {
        allDropZones.forEach(element => {
            // منطق الماوس (يعمل دائمًا)
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

    // دالة لتهيئة أحداث اللمس على الوحدات
    function setupTouchEvents(unit) {
        unit.addEventListener('touchstart', touchStart);
        unit.addEventListener('touchend', touchEnd);
        unit.addEventListener('touchcancel', touchEnd);
        unit.addEventListener('touchmove', touchMove);
    }
    
    // وظيفة بدء اللمس
    function touchStart(e) {
        if (e.target.classList.contains('draggable-unit')) {
            draggedItem = e.target;
            const touch = e.touches[0];
            
            // حساب الإزاحة
            xOffset = touch.clientX - draggedItem.getBoundingClientRect().left;
            yOffset = touch.clientY - draggedItem.getBoundingClientRect().top;
            
            draggedItem.classList.add('dragging');
            draggedItem.style.position = 'absolute';
            draggedItem.style.zIndex = '1000';
        }
    }

    // وظيفة حركة اللمس
    function touchMove(e) {
        if (draggedItem) {
            e.preventDefault(); // منع التمرير فقط عندما يتم سحب العنصر
            const touch = e.touches[0];
            
            // تحديث موقع العنصر
            draggedItem.style.left = `${touch.clientX - xOffset}px`;
            draggedItem.style.top = `${touch.clientY - yOffset}px`;
        }
    }
    
    // وظيفة انتهاء اللمس
    function touchEnd(e) {
        if (draggedItem) {
            // إخفاء تأثير السحب
            draggedItem.classList.remove('dragging');
            draggedItem.style.position = 'static'; // إعادة الموضع إلى static

            const touch = e.changedTouches[0];
            const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);

            if (dropZone && allDropZones.some(zone => dropZone.closest(`#${zone.id}`))) {
                const targetZone = allDropZones.find(zone => dropZone.closest(`#${zone.id}`));
                dropItem(targetZone);
            } else {
                // إذا لم يتم الإفلات في منطقة صالحة، ارجع العنصر إلى مكانه الأصلي (أو إلى الورشة الرئيسية)
                updateUnitColor(draggedItem, waitingWorkshop);
                waitingWorkshop.appendChild(draggedItem);
                sortUnitsAlphabetically(waitingWorkshop);
            }
            
            // إعادة تعيين المتغيرات
            draggedItem = null;
            xOffset = 0;
            yOffset = 0;
        }
    }

    // دالة إنشاء وحدة جديدة
    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`; 
        
        // إذا كان الجهاز يدعم اللمس، لا تجعل draggable=true لتجنب التعارض
        newUnit.draggable = !isTouchDevice();

        if (isTouchDevice()) {
            setupTouchEvents(newUnit);
        } else {
            // منطق السحب بالماوس
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
    
    // تهيئة مناطق الإسقاط
    setupDropZones();
});
