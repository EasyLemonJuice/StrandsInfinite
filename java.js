let board = document.querySelector(".board")
let displayText = document.querySelector(".display")
let themeText = document.querySelector(".theme")
let canvas = document.querySelector('.container')
let mouseDown = false

let selected = []
let found = []
let storedLines = []
let currentString = ""
let date = new Date()
let lastChange = date.getTime()
let lastIndex = -1
let lastRow = -1
let currentDate = ""
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function refreshLines(canv,elements,color){
    const context = canv.getContext('2d')
    context.clearRect(0, 0, canv.width, canv.height);
    let lastElement  
    for (elm of elements){
        if (lastElement){
            drawLineBetweenElements(canv,lastElement,elm,color)
        }
        lastElement = elm
    }
}

function reset(){
    document.querySelector('.lines').innerHTML = ""
    selected = []
    found = []
    storedLines = []
    let letters = document.getElementsByClassName("letter")
    letters = Array.from(letters)
    for (letter of letters){
        letter.classList.remove("gram")
        letter.classList.remove("word")
    }
}

function clearCanvas(canv){
    const context = canv.getContext('2d')
    
    context.clearRect(0, 0, canv.width, canv.height);
}

function createClone(canv,color,wordsCloned = selected){
    let clone = canv.cloneNode(true)
    refreshLines(clone,wordsCloned,color)
    document.querySelector(".lines").append(clone)
}

function drawLineBetweenElements(canv,elem1, elem2,color) {
    const context = canv.getContext('2d');
    const rect1 = elem1.getBoundingClientRect();
    const rect2 = elem2.getBoundingClientRect();
    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;

    
    
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = 20;
    context.stroke();
}

function loadLetters(matrix){
    board.innerHTML = ""
    for (rowIndex in matrix){
        let row = matrix[rowIndex]
        for (letterIndex in row){
            let letter = row[letterIndex]
            let element = document.createElement("div")
            let thisRow = rowIndex
            element.classList.add("letter")
            element.id = letterIndex
            element.innerHTML = letter
            element.addEventListener('mouseenter',()=>{
                if (mouseDown && !element.classList.contains("selected")){
                    if ((lastIndex == -1 || Math.abs(lastIndex-element.id)<=1)&&(lastRow == -1 || Math.abs(lastRow-thisRow)<=1)){
                        lastIndex = element.id
                        lastRow = thisRow
                        element.classList.add("selected")
                        selected.push(element)
                        currentString+=element.innerHTML
                        refreshLines(canvas,selected,'rgb(156, 156, 156)')
                        changeText(currentString)
                        
                    }
                }else if (mouseDown && selected[selected.length-1] != element){
                    let found = false
                    let after = 0
                    for (index in selected){
                        let elm = selected[index]
                        if (elm == element){
                            found = true
                        }else if (found == true){
                            elm.classList.remove("selected")
                            after +=1
                        }
                    }
                    for (let i = 0;i<after;i++){
                        selected.pop()
                        currentString = currentString.slice(0, -1);
                    }
                    refreshLines(canvas,selected,'rgb(156, 156, 156)')
                    changeText(currentString)
                    lastIndex = element.id
                    lastRow = thisRow
                }
            })
            element.addEventListener('mousedown',()=>{
                element.classList.add("selected")
                selected.push(element)
                currentString+=element.innerHTML
                lastIndex = element.id
                lastRow = thisRow
                changeText(currentString)
            })
            board.appendChild(element)
        }
    }
}
function wordsToArray(words){
    let matrix = []
    for (index in words){
        let row = []
        let word = words[index]
        for (letterIndex in word){
            let letter = word[letterIndex]
            row.push(letter)
        }
        matrix.push(row)
    }
    return matrix
}

function loadDate(date){
    currentDate = date
    themeText.innerHTML = days[date]['clue']
    document.querySelector(".found").textContent = "Found 0/"+days[currentDate]['themeWords'].length +1
    let info = days[date]
    let words = wordsToArray(info["startingBoard"])
    loadLetters(words)
}

function changeText(newText){
    
    displayText.innerHTML = newText
    let date = new Date()
    lastChange = date.getTime()
    setTimeout(function(){
        let currentDate = new Date()
        if (currentDate.getTime()-lastChange>900 && currentString == ""){
            displayText.innerHTML = " "
        }
    },2000)
}

loadDate('2024-05-27')

document.addEventListener('mousedown',()=>{
    mouseDown = true
})
document.addEventListener('mouseup',()=>{
    mouseDown = false
    wordFound = false
    spanagram = false
    console.log(days[currentDate]['themeWords'])
    for (word of days[currentDate]['themeWords']){
        if (currentString == word){
            wordFound = true
            storedLines.push(selected)
            found.push(word)
        }
    }
    if (currentString == days[currentDate]['spangram']){
        storedLines.push(selected)
        found.push(currentString)
        spanagram = true
    }
    currentString = ""
    for (button of selected){
        if (spanagram){
            button.classList.add("gram")
            document.querySelector(".found").textContent = "Found "+found.length+"/"+days[currentDate]['themeWords'].length +1
        }else if (wordFound){
            button.classList.add("word")
            document.querySelector(".found").textContent = "Found "+found.length+"/"+days[currentDate]['themeWords'].length +1
        }else{
            changeText("Not a theme word")
        }
        button.classList.remove("selected")
    }
    if (spanagram){
        createClone(canvas,"rgb(255, 145, 0)")
    }else if (wordFound){
        createClone(canvas,"rgb(0, 61, 99)")
    }
    clearCanvas(canvas)
    selected = []
    
})

document.getElementById("changedate").addEventListener('click',()=>{
    let year = document.getElementById("year").value
    let month = document.getElementById("month").value
    let day = document.getElementById("day").value
    if (year.length<2){
        year = "0"+year
    }
    if (month.length<2){
        month = "0"+month
    }
    if (day.length<2){
        day = "0"+day
    }
    let date = year+"-"+month+"-"+day
    if (days[date]){
        reset()
        loadDate(date)
        changeText("Date Changed")
    }else{
        changeText("Date not found")
    }
})

window.addEventListener('resize',()=>{
    document.querySelector('.lines').innerHTML = ""
    document.querySelector('.container').width = window.innerWidth
    document.querySelector('.container').height = window.innerHeight
    if (currentDate){
        for (wordLine of storedLines){
            string = ""
            for (letter of wordLine){
                string+=letter.innerHTML
            }
            if (string == days[currentDate]['spangram']){
                createClone(canvas,"rgb(255, 145, 0)",wordLine)
            }else{
                createClone(canvas,"rgb(0, 61, 99)",wordLine)
            }
        }
    }
    
})
