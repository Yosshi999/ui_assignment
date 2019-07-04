let status = "none";
let mousedown = false;
let before = null;
let mask = null;
const history = [];
let history_head = 0;
let startTime = 0;

let page = 1;
window.onload = () => {
    let idx = 0;
    const paintColor = "rgb(235, 68, 146)";
    
    const canvasL = document.createElement("canvas");
    const ctxL = canvasL.getContext("2d");
    canvasL.classList.add("innerlayer");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.classList.add("mask");
    const canvasB = document.createElement("canvas");
    const ctxB = canvasB.getContext("2d");
    
    canvas.addEventListener("mousemove", (e)=>{
        if (status == "none" || status == "bucket") return;
        /* pen / erase mode */
        let lw;
        if (status == "pen") {
            ctxL.globalCompositeOperation = 'source-over';
            lw = parseInt(document.getElementById("pen_range").value, 10);
        } else if (status == "erase") {
            ctxL.globalCompositeOperation = 'destination-out';
            lw = parseInt(document.getElementById("erase_range").value, 10);
        }
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        ctx.clearRect(0, 0, canvasL.width, canvasL.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.arc(x, y, lw/2, 0, Math.PI*2);
        ctx.stroke();
        if (!mousedown) {return;}
        /* drawing / erasing */
        
        if (!before) {
            before = {x, y};
        }
        ctxL.lineCap = "round";
        ctxL.strokeStyle = paintColor;
        ctxL.lineWidth = lw;
        ctxL.beginPath();
        ctxL.moveTo(before.x, before.y);
        ctxL.lineTo(x, y);
        ctxL.stroke();
        ctxL.closePath();
        before = {x, y};

    });
    canvas.addEventListener("mousedown", (e)=>{
        mousedown = true;
        before = null;
    });
    canvas.addEventListener("mouseup", (e)=>{
        if (mousedown && before) savehistory();
        mousedown = false;
    });
    canvas.addEventListener("mouseout", (e)=>{
        if (mousedown && before) savehistory();
        mousedown = false;
        ctx.clearRect(0, 0, canvasL.width, canvasL.height);
    });

    document.getElementById("paint").appendChild(canvas);
    document.getElementById("paint").appendChild(canvasL);
    document.getElementById("paint").appendChild(canvasB);
    function setCount(idx) {
        document.getElementById("count").innerText = `${idx} / 8`;
    }

    function initialize() {
        const modes = document.getElementsByClassName("block");
        for (let i=0; i<modes.length; i++) {
            modes[i].classList.remove("active");
            modes[i].parentElement.getElementsByClassName("slider")[0].classList.remove("active");
            modes[i].onclick = function() {
                status = this.getAttribute("id");
                console.log(status);
                for (let i=0; i<modes.length; i++) {
                    modes[i].classList.remove("active");
                    modes[i].parentElement.getElementsByClassName("slider")[0].classList.remove("active");
                }
                this.classList.add("active");
                if (status == "pen" || status == "erase") this.parentElement.getElementsByClassName("slider")[0].classList.add("active");
            };
        }
        $redo.classList.add("invalid");
        $undo.classList.add("invalid");
        history.splice(0);
        history_head = 0;
        startTime = Date.now();
    }

    const $undo = document.getElementById("undo");
    const $redo = document.getElementById("redo");
    function savehistory() {
        if (history.length != history_head) {
            history.splice(history_head);
        }
        history.push(ctxL.getImageData(0, 0, canvasL.width, canvasL.height));
        history_head++;
        
        $redo.classList.add("invalid");
        $undo.classList.remove("invalid");
    }
    function undo() {
        if (history_head == 0) return;
        history_head--;
        if (history_head == 0) ctxL.clearRect(0, 0, canvasL.width, canvasL.height);
        else ctxL.putImageData(history[history_head-1], 0, 0);
        $redo.classList.remove("invalid");
        if (history_head == 0) $undo.classList.add("invalid");
        else $undo.classList.remove("invalid");
    }
    function redo() {
        if (history_head == history.length) return;
        history_head++;
        ctxL.putImageData(history[history_head-1], 0, 0);
        $undo.classList.remove("invalid");
        if (history_head == history.length) $redo.classList.add("invalid");
        else $redo.classList.remove("invalid");
    }
    $undo.onclick = undo;
    $redo.onclick = redo;



    function openImg() {
        canvas.width = 100;
        canvas.height = 100;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        canvasB.width = 100;
        canvasB.height = 100;
        ctxB.fillStyle = "black";
        ctxB.fillRect(0, 0, canvasB.width, canvasB.height);
        canvasL.width = 100;
        canvasL.height = 100;
        ctxL.fillStyle = "black";
        ctxL.fillRect(0, 0, canvasL.width, canvasL.height);


        let element = new Image();
        element.onload = function() {
            canvas.width = element.naturalWidth;
            canvas.height = element.naturalHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            canvasB.width = element.naturalWidth;
            canvasB.height = element.naturalHeight;
            ctxB.drawImage(element, 0, 0);

            canvasL.width = element.naturalWidth;
            canvasL.height = element.naturalHeight;
            ctxL.clearRect(0, 0, canvasL.width, canvasL.height);
        }
        element.src = `images/image${idx}.jpg`;
        status = "none";
    }
        
    function onNext() {
        console.log("next button...");
        idx++;
        setCount(idx);
        openImg();
        initialize();
    }
    document.getElementById("back").onclick = () => {
        if (page != 2) return;
        page = 1;
        document.getElementById("page1").classList.remove("hide");
        document.getElementById("page2").classList.add("hide");
    }
    document.getElementById("confirm").onclick = () => {
        if (page != 2) return;
        page = 1;
        document.getElementById("page1").classList.remove("hide");
        document.getElementById("page2").classList.add("hide");
    
        console.log(`idx: ${idx}, time:${Math.floor((Date.now() - startTime)/1000)}`);
        window.open(canvasL.toDataURL("image/png").replace("image/png", "image/octet-stream"));

        onNext();
    }

    document.getElementById("next").onclick = () => {
        page = 2;
        document.getElementById("page2").classList.remove("hide");
        document.getElementById("page1").classList.add("hide");
        const cp = document.getElementById("canvasP");
        const ctxp = cp.getContext("2d");
        cp.width = canvas.width;
        cp.height = canvas.height;
        ctxp.globalCompositeOperation = "source-over";
        ctxp.clearRect(0, 0, cp.width, cp.height);
        ctxp.drawImage(canvasL, 0, 0);
        ctxp.globalCompositeOperation = "source-in";
        ctxp.drawImage(canvasB, 0, 0);

    };
    setCount(idx);
    openImg();
    initialize();

}