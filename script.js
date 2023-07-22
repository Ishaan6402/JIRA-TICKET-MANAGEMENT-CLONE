// let localStorage=window.localStorage;
let addBtn = document.querySelector(".add-button");
let removeEle = document.querySelector(".remove-button");
let modalEle = document.querySelector(".modal-container");
let maincont = document.querySelector(".main-container");
let textarea = document.querySelector(".textarea-container");
let toolboxCont = document.querySelector(".toolbox-container")
let allPriorityColors = document.querySelectorAll(".priority-colors");
let removeinfoELe = document.querySelector(".removebuttoninfo-para");
let toolboxcolor = document.querySelectorAll(".color");
let homebuttoncont = document.querySelector(".home-button");
let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1];

let addflag = false;
let removeflag = false;

let tickettask;

let lockclass = "fa-lock";
let unlockclass = "fa-unlock";

let ticketsArr = [];

if(localStorage.getItem("jira_tickets")){
    ticketsArr=JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj)=>{
        createTicket(ticketObj.ticketcolor, ticketObj.tickettask, ticketObj.ticketID);
    })
}

for (let i = 0; i < toolboxcolor.length; i++) {
    toolboxcolor[i].addEventListener("click", (e) => {
        let currentToolBoxColor = toolboxcolor[i].classList[0];

        let filteredtickets = ticketsArr.filter((ticketObj, idx) => {
            return currentToolBoxColor === ticketObj.ticketcolor;
        });

        //remove previous tickets
        let allticketscont = document.querySelectorAll(".ticket-container");
        for (let i = 0; i < allticketscont.length; i++) {
            allticketscont[i].remove();
        }

        //display new filtered tickets
        filteredtickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketcolor, ticketObj.tickettask, ticketObj.ticketID);
        });
    });
}

homebuttoncont.addEventListener("click", (e) => {
    let allticketscont = document.querySelectorAll(".ticket-container");
    for (let i = 0; i < allticketscont.length; i++) {
        allticketscont[i].remove();
    }

    ticketsArr.forEach((ticketObj, idx) => {
        createTicket(ticketObj.ticketcolor, ticketObj.tickettask, ticketObj.ticketID);
    });
});

// listener for the priority modal coloring
allPriorityColors.forEach((colorEle, idx) => {
    colorEle.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorEle, idx) => {
            priorityColorEle.classList.remove("border");
        })
        colorEle.classList.add("border");
        modalPriorityColor = colorEle.classList[0];
    })
})

addBtn.addEventListener("click", (e) => {
    //create Modal
    //generate ticket

    //if addflag-> false , modal none
    //if addflag-> true , modal display

    addflag = !addflag;
    if (addflag) {
        modalEle.style.display = "flex";
    } else {
        modalEle.style.display = "none";
    }
})

modalEle.addEventListener("keydown", (e) => {
    let key = e.key;
    if (key === "Shift") {
        tickettask = textarea.value;
        createTicket(modalPriorityColor, tickettask);
        addflag = false;
        setmodaltodefault();
    }
})

removeEle.addEventListener("click", (e) => {
    removeflag = !removeflag;
    if (removeflag) {
        removeinfoELe.style.display = "flex";
    } else {
        removeinfoELe.style.display = "none";
    }
})

function createTicket(ticketcolor, tickettask, ticketID) {
    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-container");
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketcolor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-container">${tickettask}</div>
        <div class="ticket-lock">
                <i class="fa-solid fa-lock"></i>
        </div>
    `;
    maincont.appendChild(ticketCont);

    //creating an object of the ticket and appending in the ticket array
    if (!ticketID) {
        ticketsArr.push({ ticketcolor, tickettask, ticketID: id });
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
    }

    ticketCont.addEventListener("click", (e) => {
        if (removeflag) {
            removeinfoELe.style.display = "flex";
        } else {
            removeinfoELe.style.display = "none";
        }
        handleremoval(ticketCont,id);
        handlecolor(ticketCont,id);
    });
    handlelock(ticketCont,id);
}

function handleremoval(ticket,id) {
    //removing the tickets in the windows of JIRA
    // remove if flag is true
    // no remove if the flag is false.
    if (removeflag) {
        let ticketidx=getTicketIdx(id);
        ticketsArr.splice(ticketidx,1);
        let strticketarr=JSON.stringify(ticketsArr);
        localStorage.setItem("jira_tickets",strticketarr);

        ticket.remove();
    }
}

function handlelock(ticket,id) {
    let ticketlockELe = ticket.querySelector(".ticket-lock");
    let ticketlock = ticketlockELe.children[0];
    let ticketTaskArea = ticket.querySelector(".task-container");
    ticketlock.addEventListener("click", (e) => {
        let ticketidx=getTicketIdx(id)
        if (ticketlock.classList.contains(lockclass)) {
            ticketlock.classList.remove(lockclass);
            ticketlock.classList.add(unlockclass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        } else {
            ticketlock.classList.remove(unlockclass);
            ticketlock.classList.add(lockclass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        //modify data in locallstorage (ticket task )
        ticketsArr[ticketidx].tickettask=ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
    })
}

function handlecolor(ticket , id) {
    let ticketcolorEle = ticket.querySelector(".ticket-color");
    ticketcolorEle.addEventListener("click", (e) => {
        //getting id inder form the tickets array
        let ticketidx=getTicketIdx(id);

        let currentTicketColor = ticketcolorEle.classList[1];
        let currentTicketColoridx = colors.indexOf(currentTicketColor);
        currentTicketColoridx++;
        let newticketcoloridx = currentTicketColoridx % colors.length;
        let newticketcolor = colors[newticketcoloridx];
        ticketcolorEle.classList.remove(currentTicketColor);
        ticketcolorEle.classList.add(newticketcolor);

        //modify data in local storage of priority color change
        ticketsArr[ticketidx].ticketcolor=newticketcolor;
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr))
    });
}

function getTicketIdx(id){
    let ticketidx=ticketsArr.findIndex((ticketObj)=>{
        return ticketObj.ticketID===id;
    })
    return ticketidx;
}

function setmodaltodefault() {
    modalEle.style.display = "none";
    textarea.value = "";
    modalPriorityColor = colors[colors.length - 1];
    allPriorityColors.forEach((priorityColorEle, idx) => {
        priorityColorEle.classList.remove("border");
    });

    allPriorityColors[allPriorityColors.length - 1].classList.add("border");


}