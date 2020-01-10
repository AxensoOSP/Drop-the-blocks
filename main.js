const time = 5

var duration = time,
    scoreboard = {},
    zones = document.querySelectorAll('.dropzone'),
    elements = document.querySelectorAll('.drag-drop'),
    timer, countdown

function dragMoveListener(event) {
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

    // translate the element
    target.style.left = x + "px"
    target.style.top = y + "px"

    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
}

function snap_in_place(element, zone) {
    element.style.left = zone.style.left
    element.style.top = zone.style.top

    element.setAttribute('data-x', zone.style.left)
    element.setAttribute('data-y', zone.style.top)
}

function check_scoreboard() {
    points = Object.values(scoreboard)
    if (points.every(k => k.right)) {

        /*******
         * L'utente ha vinto, fai il trigger della modal
         ********/

        end_game("Win")

    } else if (points.every(k => k.dropped)) {

        /*******
         * L'utente ha piazzato tutti i blocchi ma non tutti nel punto giusto
         ********/

        end_game("Try again")

    } else {

        /*******
         * L'utente non ha ancora piazzato tutti i blocchi
         ********/

    }
}

function reset_shapes() {

    document.querySelectorAll(".drag-drop").forEach(e => {
        e.removeAttribute("style")
        e.removeAttribute("data-y")
        e.removeAttribute("data-x")
    })

    scoreboard = {}
    document.querySelectorAll(".drag-drop").forEach(x => scoreboard[x.getAttribute("zone")] = {
        dropped: false,
        right: false
    })
}

function reset_countdown() {
    clearInterval(countdown)
    clearTimeout(timer)

    duration = time
    var count = document.querySelector("#countdown")
    count.innerText = duration
    countdown = setInterval(() => count.innerText = --duration, 1000)
    timer = setTimeout(() => {

        /*******
         * Il tempo è finito
         ********/

        document.querySelector(".modal-title").innerText = "Try Again"
        count.innerText = 0
        clearInterval(countdown)

        end_game("Try again")

    }, 1000 * duration)
}

function end_game(outcome) {
    document.querySelector(".modal-title").innerText = outcome
    clearInterval(countdown)
    clearTimeout(timer)
    document.querySelector("#start").innerHTML = "Start"
    document.querySelector(".modal").style.display = "block"
}

function start_game() {
    interact('.drag-drop').unset()

    document.querySelector("#start").innerHTML = "Restart"

    reset_shapes()
    reset_countdown()

    document.querySelector(".modal").style.display = "none"
    document.querySelector(".game").classList.add("is-on")

    zones.forEach(e => {
        e.style.top = e.getBoundingClientRect().top + "px"
        e.style.left = e.getBoundingClientRect().left + "px"
    })
    zones.forEach(e => e.style.position = "absolute")

    // enable draggables to be dropped into this
    interact('.dropzone').dropzone({
        // only accept elements matching this CSS selector
        accept: '.drag-drop',
        // Require a 75% element overlap for a drop to be possible
        overlap: 0.75,

        // listen for drop related events:

        ondropactivate: function (event) {
            // add active dropzone feedback
            event.target.classList.add('drop-active')
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget
            var dropzoneElement = event.target

            // feedback the possibility of a drop
            dropzoneElement.classList.add('drop-target')
            draggableElement.classList.add('can-drop')
            // draggableElement.textContent = 'ondragenter'
        },
        ondragleave: function (event) {
            // remove the drop feedback style
            event.target.classList.remove('drop-target')
            event.relatedTarget.classList.remove('can-drop')
            // event.relatedTarget.textContent = 'ondragleave'
            scoreboard[event.relatedTarget.getAttribute("zone")].dropped = false
        },
        ondrop: function (event) {
            scoreboard[event.relatedTarget.getAttribute("zone")].dropped = true
            if (event.relatedTarget.getAttribute("zone") == event.target.getAttribute("zone"))
                scoreboard[event.relatedTarget.getAttribute("zone")].right = true;
            snap_in_place(event.relatedTarget, event.target)
            check_scoreboard()
        },
        ondropdeactivate: function (event) {
            // remove active dropzone feedback
            event.target.classList.remove('drop-active')
            event.target.classList.remove('drop-target')
        }
    })

    elements.forEach(e => {
        var x = e.getBoundingClientRect().left + "px"
        var y = e.getBoundingClientRect().top + "px"

        e.style.left = x
        e.style.top = y

        e.setAttribute('data-x', x)
        e.setAttribute('data-y', y)
    })
    elements.forEach(e => e.style.position = "absolute")

    interact('.drag-drop').draggable({
        inertia: true,
        autoScroll: true,
        onmove: dragMoveListener,
    })
}