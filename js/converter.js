var formObj, gridObj = {}

document.querySelector('#uip-file').addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()

        reader.onload = (e) => {
            const fileContent = e.target.result
            // console.log('fileContent', fileContent) 확인

            const parser = new DOMParser()
            const doc = parser.parseFromString(fileContent, "text/html")
            // console.log('doc', doc) 확인

            const pageContent = doc.querySelector('.page-content')
            const modules = pageContent.querySelectorAll('.module-wrapper')

            // 모듈 영역 순환
            modules.forEach((el) => {
                if (el.querySelector('.page-search')) {
                    // 조회 폼이 있는 경우
                    formObj = searchFormObjectCreate(el)
                    formObj.buttons = searchFormBtnCreate(el)
                    createSearchFormDOM(formObj)
                }
                // if (el.querySelector('.table-detail')) {
                //     // 디테일 폼이 있는 경우
                // }
                if (el.querySelector('.table-list')) {
                    // 조회 그리드가 있는 경우
                    gridObj = listTableObjectCreate(el)
                    createListGridDOM(gridObj)
                }
            })
        }

        reader.readAsText(file)

        document.querySelector('#btn-area-convert').style.display = 'block'
    } else {
        return false
    }
})

function createSearchFormDOM(frm) {
    const searchForms = document.querySelector('#search-form')

    if (frm.details.length > 0) {
        searchForms.style.display = 'block'
        document.querySelector('#search-form-title').textContent = 'Search Form: ' + frm.title

        const searchFormDetail = document.querySelector('#search-form-detail')
        searchFormDetail.innerHTML = ''

        // DOM 삽입
        let newElementHTML = `
        <table class="table table-bordered">
        <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">필드 ID(영문권장)</th>
            <th scope="col">필드명</th>
            <th scope="col">필드구분</th>
            <th scope="col">필드타입(*input)</th>
            <th scope="col">옵션(*select)</th>
            <th scope="col">삭제</th>
        </tr>
        </thead>
        <tbody id="form-tbody">
        <form name="searchForm">
        `
        frm.details.forEach((data, index) => {
            newElementHTML += `
                <tr>
                <th scope="row">${index}</th>
                <td><input type="text" class="form-control" value="${data.id}"></td>
                <td>${data.label}</td>
                <td><select class="form-control">
            `
            if (data.objTyp === 'input') {
                newElementHTML += `
                <option selected>input</option>
                <option>select</option>
                </select>
                <td>${data.type}</td>
                <td></td>
                `
            }
            if (data.type === 'select') {
                const nameArray = data.items.map(item => item.name);
                newElementHTML += `
                <option>input</option>
                <option selected>select</optionselected>
                </select>
                <td></td>
                <td>${JSON.stringify(nameArray)}</td>
                `
            }
            newElementHTML += `
                <td><button type="button" class="btn btn-danger" onclick="deleteThisRow(this, 'form')">X</button></td>
            </tr>`
        })
        newElementHTML += `
        </form>
        </tbody>
        </table>`
        if (frm.buttons.length > 0) {
            newElementHTML += `<hr/><div id="search-form-buttons">`
            frm.buttons.forEach((btn) => {
                newElementHTML += `<button class="btn btn-outline-dark" id="${btn.id}">${btn.name}</button>`
            })
            newElementHTML += `</div>`
        }
        searchFormDetail.insertAdjacentHTML('beforeend', newElementHTML)
    }
}

function createListGridDOM(gridEl) {
    const listTable = document.querySelector('#list-table')

    // DOM 삽입
    if (gridEl.rows.length > 0) {
        listTable.style.display = 'block'
        document.querySelector('#list-table-title').textContent = 'List Table: ' + gridEl.title

        const listTableDetail = document.querySelector('#list-table-detail')
        listTableDetail.innerHTML = ''

        let newElementHTML = `
        <table class="table table-bordered">
        <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">필드 ID(영문권장)</th>
            <th scope="col">헤더명(표기명)</th>
            <th scope="col">컬럼타입</th>
            <th scope="col">삭제</th>
        </tr>
        </thead>
        <tbody id="list-tbody">
        `
        gridEl.rows.forEach((data, index) => {
            newElementHTML += `<tr>
                <th scope="row">${index}</th>
                <td><input type="text" class="form-control" value="${data.field}"></td>
                <td>${data.headerName}</td>
                <td><select class="form-control">`
            if (data.type === 'string') {
                newElementHTML += `
                <option selected>string</option>
                <option>input</option>
                <option>select</option>
                `
            }
            if (data.type === 'input') {
                newElementHTML += `
                <option>string</option>
                <option selected>input</option>
                <option>select</option>
                `
            }
            if (data.type === 'select') {
                newElementHTML += `
                <option>string</option>
                <option>input</option>
                <option selected>select</optionselected>
                `
            }
            newElementHTML += ` </select>
                <td><button type="button" class="btn btn-danger" onclick="deleteThisRow(this, 'list')">X</button></td>
            </tr>`
        })
        newElementHTML += `</tbody></table>`
        listTableDetail.insertAdjacentHTML('beforeend', newElementHTML)
    }
}

function searchFormBtnCreate(el) {
    const pageSearch = el.querySelector('.page-search')
    const ul = pageSearch.querySelector('ul')
    const buttons = ul.querySelectorAll('button')

    let buttonArr = []
    buttons.forEach((btn) => {
        buttonArr.push({
            id: btn.id,
            name: btn.querySelector('span').textContent
        })
    })
    return buttonArr
}

function searchFormObjectCreate(el) {
    const pageSearch = el.querySelector('.page-search')
    const table = pageSearch.querySelector('table')
    const tableRows = table.querySelectorAll('tr')

    let elDetail = {
        title: el.querySelector('h3') ? el.querySelector('h3').textContent : ''
    }
    let elementDetails = []
    // UIP 산출물 파일 내부 DOM 읽기
    let idx = 0

    let colCntInRow = 0
    tableRows.forEach((tr) => {
        colCntInRow = 0
        tr.querySelectorAll('td').forEach((td) => {
            let formEl

            if (td.querySelector('input')) {
                formEl = td.querySelector('input')

                // input type date로 치환해야 하는 경우
                let inputObj = {
                    idx: idx,
                    objTyp: 'input',
                    label: formEl.name,
                    id: formEl.id
                }
                if (td.querySelector('div.datepicker')) {
                    inputObj.type = 'date'
                } else {
                    inputObj.type = formEl.getAttribute('type')
                }
                elementDetails.push(inputObj)

            } else {
                formEl = td.querySelector('select')
                const options = formEl.querySelectorAll('option')
                let optArr = []
                options.forEach((obj) => {
                    optArr.push({
                        name: obj.text,
                        value: obj.value
                    })
                })
                elementDetails.push({
                    idx: idx,
                    objTyp: 'select',
                    label: formEl.name,
                    type: 'select',
                    items: optArr,
                    id: formEl.id
                })
            }
            idx++
            colCntInRow++
        })
    })
    elDetail.details = elementDetails
    elDetail.colCnt = colCntInRow * 2
    return elDetail
}

function listTableObjectCreate(el) {
    const tableList = el.querySelector('.table-list')
    const tableBody = tableList.querySelector('tbody')
    const tableHead = tableBody.querySelectorAll('tr')[0]
    const tableCol = tableHead.querySelectorAll('td')

    let gridDetail = {
        title: el.querySelector('h3') ? el.querySelector('h3').textContent : ''
    }
    let gridColumnsDetail = []

    let idx = 0
    tableCol.forEach((td) => {
        let colDef = {
            idx: idx,
            editable: false,
            floatingFilter: true,
            sortable: true,
            autoSize: true
        }
        if (td.querySelector('span')) {
            const span = td.querySelector('span')
            if (span.textContent !== '') {
                colDef.field = span.id
                colDef.headerName = span.textContent
                colDef.type = 'string'
                gridColumnsDetail.push(colDef)
            }
        }
        if (td.querySelector('select')) {
            const select = td.querySelector('select')
            colDef.field = select.id
            colDef.headerName = select.name
            colDef.type = 'select'
            gridColumnsDetail.push(colDef)
        }
        if (td.querySelector('input')) {
            // checkbox 제외
            const input = td.querySelector('input')
            const type = input.getAttribute('type')
            if (type !== 'checkbox') {
                colDef.field = input.id
                colDef.headerName = input.name
                colDef.type = 'input'
                gridColumnsDetail.push(colDef)
            }
        }
        idx++
    })
    gridDetail.rows = gridColumnsDetail
    return gridDetail
}

function deleteThisRow(el, type) {
    const tr = el.parentNode.parentNode
    const index = tr.querySelector('th').textContent
    tr.remove()

    if (type === 'form') {
        let removeIdx = formObj.details.findIndex(frm => frm.idx == index)
        console.log(removeIdx)
        if (removeIdx !== -1) {
            formObj.details.splice(removeIdx, 1)
        }
    } else {
        let removeIdx = gridObj.rows.findIndex(grd => grd.idx == index)
        console.log(removeIdx)
        if (removeIdx !== -1) {
            gridObj.rows.splice(removeIdx, 1)
        }
    }
}

function convertSvelteCode() {
    if (document.querySelector('#page-title').value === '') {
        alert('프로그램명을 기입해주세요.')
        return false;
    }

    let searchFormEl = document.querySelector('form[name=searchForm]')


    let svelteCode = `<script>
        // @ts-nocheck
        import {
            Breadcrumb, BreadcrumbItem, Button, Card, Heading, Input, Label, Select
        } from 'flowbite-svelte';
        import {onMount} from 'svelte';
        import AgGrid from '$lib/grid/AgGrid.svelte';
    
        function changeInput(event) {
            const id = event.target.id;
            const value = event.target.value;
            console.log(id, value);
            for (let i = 0; i < formData.length; i++) {
                if (formData[i].id === id) {
                    formData[i].value = value;
                    break;
                }
            }
        }
        
        // Grid Info
        // 실제 그리드로 전달되는 옵션
        let columnDefs;
        let gridOptions = {
            columnDefs: columnDefs,
            defaultColDef: {
                width: 100,
                editable: true,
                filter: 'agTextColumnFilter'
            },
            defaultColGroupDef: {
                marryChildren: true
            },
            headerHeight: 30,
            floatingFiltersHeight: 30,
            columnTypes: {
                nonEditableColumn: {editable: false},
                dateColumn: {
                    filter: 'agDateColumnFilter',
                    suppressMenu: true
                }
            },
            rowData: [],
            autoSizeStrategy: {
                type: 'fitCellContents'
            },
            localeText: {noRowsToShow: '조회 결과가 없습니다.'},
            rowHeight: 30
        };
        
        function updateGridOptions(newData) {
            let newColumnDefs
            console.log('newData', newData.length);
            if (newData.length > 0) {
                // ----
                const dataKeys = Object.keys(newData[0]);
                newColumnDefs = dataKeys.map((key) => {
                    return {
                        field: key,
                        headerName: key.charAt(0).toUpperCase() + key.slice(1), // 첫 글자 대문자로 변환하여 사용
                        editable: false,
                        // filter: 'agTextColumnFilter',
                        floatingFilter: true,
                        sortable: true,
                        autoSize: true
                    };
                });
                // ----
            } else {
                newColumnDefs = columnDefs
            }
            gridOptions = {...gridOptions, columnDefs: newColumnDefs, rowData: newData};
        }
    `

    svelteCode += `const menuName = "${document.querySelector('#page-title').value}";`
    if (formObj) {
        svelteCode += `
            const formName = '${formObj.title}';
            let formData = ${JSON.stringify(formObj.details)}
        `
    }
    if (gridObj) {
        svelteCode += `
            columnDefs = ${JSON.stringify(gridObj.rows)}
            gridOptions = {...gridOptions, columnDefs: columnDefs, rowData: []};
        `
    }

    svelteCode += `
        </script>

        <main class="relative w-full h-full p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <!-- Breadcrumbs -->
            <Breadcrumb class="mb-5">
                <BreadcrumbItem home>Home</BreadcrumbItem>
                <BreadcrumbItem
                        class="inline-flex items-center text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white"
                        href="/rental/search">{menuName}</BreadcrumbItem
                >
                <BreadcrumbItem>{formName}</BreadcrumbItem>
            </Breadcrumb>
        
            <Heading tag="h1" class="mb-4 font-semibold tracking-wide text-xl sm:text-2xl">{menuName}</Heading>
        
            <div class="grid grid-cols-1 pt-2 xl:grid-cols-1 xl:gap-4 dark:bg-gray-900">
                <div class="col-span-2 space-y-4">
                    <Card size="xl">
                        <Heading tag="h3" class="mb-4 text-xl font-medium tracking-wide dark:text-white">{formName}</Heading>
                        <form class="grid grid-cols-${formObj.colCnt} gap-4">
                        {#each formData as {objTyp, label, id, type, placeholder, value, items}}
                          {#if objTyp === 'input'}
                            <Label class="space-y-2 col-span-1 sm:col-span-1 text-md text-center">
                              <span>{label}</span>
                            </Label>
                            <Input class="font-normal space-y-2 col-span-1 sm:col-span-1"
                             {id}
                             {type}
                             {placeholder}
                             {value}
                             on:change={changeInput}
                            />
                          {/if}
                          {#if objTyp === 'select'}
                            <Label class="space-y-2 col-span-1 sm:col-span-1 text-md text-center">
                              <span>{label}</span>
                            </Label>
                            <Select {id} class="font-normal space-y-2 col-span-1 sm:col-span-1" {items} on:change={changeInput}/>
                          {/if}
                        {/each}
                        </form>
                        <div class="grid grid-cols-6 gap-6 mt-6 ">`
    if (formObj.buttons.length > 0) {
        formObj.buttons.forEach((btn) => {
            svelteCode += `<Button size="sm" id="${btn.id}" outline >${btn.name}</Button>`
        })
    }
    svelteCode += `</div></Card></div></div>`
    if (gridObj) {
        svelteCode += `
            <div class="grid grid-cols-1 xl:grid-cols-1 xl:gap-4 mt-8">
                <AgGrid gridName="${gridObj.title}" {gridOptions}/>
            </div>
        `
    }
    svelteCode += `</main>`
    editor.setValue(svelteCode)
}