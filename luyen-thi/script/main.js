var data = []
fetch(path)
    .then((response) => response.text())
    .then((text) => {
        let lines_list = text.split("\n");
        lines_list.splice(0, 3);
        lines_list.splice(-1, 1);

        for (let line of lines_list) {
            let items = line.split("\t");
            data.push({
                id: data.length,
                deckName: items[0],
                question: items[1],
                a: items[2],
                b: items[3],
                c: items[4],
                d: items[5],
                key: items[6],
                explain: items[7]
            })
        }
        // random câu hỏi
        randomData(data);
        // console.log(data.map(item => item.id)); // check random
        saveData(data);
        renderDeckList(data);
    })

$(document).ready(function () {
    $("#deck-list").change(function () {
        let deckName = $(this).val()
        saveCurrentDeck(deckName);
        renderContentExam(deckName);
    })
})

// FUNCTION
function randomData(data) {
    data.sort(function (a, b) {
        return Math.random() - 0.5;
    })
}

function swapListItem(list, stringKey1, stringKey2) {
    // XÁC ĐỊNH INDEX1 LUYỆN TẬP TRẮC NGHIỆM 2
    // XÁC ĐỊNH INDEX2 BÀI TẬP GIỮA KỲ 1
    // CHÈN INDEX2 SAU INDEX 1
    // XOÁ INDEX2
    let index1 = list.findIndex(function searchIndex(item) {
        return item.includes(stringKey1);
    })
    let index2 = list.findIndex(function searchIndex(item) {
        return item.includes(stringKey2);
    })
    list.splice(index1 + 1, 0, list[index2])
    list.splice(index2, 1)
}
function renderDeckList(data) {
    let list = data.map(item => item.deckName);
    list = [...new Set(list)];
    list.sort(); //sắp xếp theo thứ tự chữ cái
    swapListItem(list, "trắc nghiệm 2", "giữa kỳ số 1")
    swapListItem(list, "trắc nghiệm 3", "giữa kỳ số 2")

    $("#deck-list").append(`<option values='' disabled selected>Chọn nội dung</option>`)
    for (let deckName of list) {
        $("#deck-list").append(`<option value='${deckName}'>${deckName.replace(text_replace, '')}</option>`);
    }

    saveDeckList(JSON.stringify(list));
}

function renderQuestion(item) {
    let abcd = [0, 1, 2, 3];
    abcd.sort(function (a, b) { return 0.5 - Math.random() });
    return `
        <div class="wp-question">
            <div class="question-content">${item.question}</div>
            <div class="choice-option">
                <label style="order: ${abcd[0]}"><input type="radio" name="q-${item.id}">${item.a}</label>
                <label style="order: ${abcd[1]}"><input type="radio" name="q-${item.id}">${item.b}</label>
                <label style="order: ${abcd[2]}"><input type="radio" name="q-${item.id}">${item.c}</label>
                <label style="order: ${abcd[3]}"><input type="radio" name="q-${item.id}">${item.d}</label>
            </div>
            <div class="key-explain">
                <mark>${item.key}</mark>   
                <p class="explain">${item.explain}</p>
                <div class="action" ><button class="redo" data-index="${item.id}">Làm lại câu này</button></div>
            </div>
        </div>
        `;
}

function renderContentExam(deckName) {
    // save current Deck
    saveCurrentDeck(deckName)
    let data_filter = getData().filter(item => item.deckName == deckName);
    $("#content-exam").html(""); // reset content
    for (const item of data_filter) {
        $("#content-exam").append(renderQuestion(item));
    }

    $(".key-explain button.redo").click(redo);
    $("#content-exam").prepend(`<h1>${getCurrentDeck().replace(text_replace, "")}</h1>`);
    removeEmptyTag()
    removeQuotes()

    // addEvent View Key And Explain
    $("input[type='radio']").click(function () {
        let input = $(this);
        let keyExplainElm = $(this).parents(".choice-option").next();
        keyExplainElm.slideDown(100);

        setTimeout(function scrollNextToQuestion() {
            // scroll next
            console.log(input.closest(".wp-question").next())
            if (input.closest(".wp-question").next().get(0)) {
                input.closest(".wp-question").next().get(0).scrollIntoView({
                    "behavior": "smooth",
                    "block": "center"
                });
            } else {
                // else: reload
                keyExplainElm.get(0).scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                })
            }
        }, 100)

    })

}

function scrollToTop() {
    renderContentExam(getCurrentDeck())
    $("html, body").animate({ scrollTop: 0 }, 1000); // lên đầu trang
}

function doNextDeck() {
    let currentDeck = getCurrentDeck();
    let deckList = JSON.parse(localStorage.getItem("deckList"))
    let nextDeck_index = deckList.indexOf(currentDeck) + 1;
    if (deckList[nextDeck_index]) {
        renderContentExam(deckList[nextDeck_index]);
    } else {
        renderContentExam(deckList[0]);
    }
    scrollToTop();
}

function redo() {
    /* 
      LÀM LẠI CÂU HỎI KHI NHẤN VÀO NÚT LÀM LẠI
      - Clone Node
      - Xoá node hiện tại
      - Append lại vô content-exam, uncheck, slideUp
    */
    let currentQuestion = $(this).closest(".wp-question");
    $("#content-exam").append(currentQuestion.clone())
    currentQuestion.remove();
    // remove current
    let lastQuestion = $(".wp-question").eq(-1);
    // uncheck
    lastQuestion.find("input").prop('checked', false);
    lastQuestion.find(".key-explain").slideUp(1000)

    // addEvent View Key And Explain
    lastQuestion.click(function () {
        let input = $(this);
        let keyExplainElm = input.closest(".wp-question").find(".key-explain");
        console.log(keyExplainElm)
        keyExplainElm.slideDown(100);
        keyExplainElm.find("button.redo").click(redo);

        setTimeout(function scrollNextToQuestion() {
            // scroll next
            console.log(input.closest(".wp-question").html())
            if (input.closest(".wp-question").next().get(0)) {
                input.closest(".wp-question").next().get(0).scrollIntoView({
                    "behavior": "smooth",
                    "block": "center"
                });
            } else {
                // else: reload
                keyExplainElm.get(0).scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                })
            }
        }, 200)
    })


}

function saveCurrentDeck(deckName) {
    localStorage.setItem('currentDeck', deckName);
}

function saveDeckList(deckList) {
    localStorage.setItem('deckList', deckList);
}

renderContentExam(getCurrentDeck());
console.log(`getCurrentDeck()`, getCurrentDeck());
function getCurrentDeck() {
    let current =  (localStorage.getItem("currentDeck") == null) ? data[0].deckName : localStorage.getItem("currentDeck");
    if (!current.includes(text_replace)) {
        return JSON.parse(localStorage.getItem("deckList"))[0];
    }
    return current;
}

function saveData(data) {
    localStorage.setItem('data', JSON.stringify(data));
}

function getData() {
    return JSON.parse(localStorage.getItem("data"))
}

// xoá dấu """ ở trong câu hỏi
function removeEmptyTag() {
    $("p:empty").remove();
    $("p:contains('\"\"')").remove()
    $("p:contains('\"')").remove();

    $(".action").each(function (index, element) {
        element.previousSibling.previousSibling.remove()
    })
    // console.log($(".action").get(0).previousSibling.previousSibling.remove());
}
function removeQuotes() {
    $(".question-content, p.explain").each(function (index, element) {
        //   console.log(index);
        //   console.log(element.innerHTML);

        if (element.innerHTML.match(/<[\s\S]*>/)) {
            element.innerHTML = element.innerHTML.match(/<[\s\S]*>/)[0];
        }
    })
}

// thêm nút làm lại & làm tiếp ở cuối trang
$(".btn-group").append("<button class='renew' onclick='scrollToTop()'>Làm lại</button><button class='new' onclick='doNextDeck()'>Làm tiếp</button>")