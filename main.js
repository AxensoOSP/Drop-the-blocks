function start_game() {
    document.querySelector(".modal").style.display = "none"
    document.querySelector(".game").classList.add("is-on")
    reset_shapes()
    start_countdown()

    // Bit mask for the dropped elements
    var scoreboard = {}
    document.querySelectorAll(".drag-drop").forEach(x => scoreboard[x.id] = {
        dropped: false,
        right: false
    })

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
            scoreboard[event.relatedTarget.id].dropped = false
        },
        ondrop: function (event) {
            scoreboard[event.relatedTarget.id].dropped = true
            if (event.relatedTarget.id == event.target.id)
                scoreboard[event.relatedTarget.id].right = true;
            check_scoreboard(event.relatedTarget.id)
        },
        ondropdeactivate: function (event) {
            // remove active dropzone feedback
            event.target.classList.remove('drop-active')
            event.target.classList.remove('drop-target')
        }
    })

    interact('.drag-drop')
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            autoScroll: true,
            onmove: dragMoveListener
        })

    function dragMoveListener(event) {
        var target = event.target
        // keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

        // translate the element
        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

        // update the posiion attributes
        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
    }

    function check_scoreboard(id) {
        if (typeof check_scoreboard.win != 'undefined')
            return console.log("The game is over")

        points = Object.values(scoreboard)
        if (points.every(k => k.right)) {
            check_scoreboard.win = true

            /*******
             * L'utente ha vinto, fai il trigger della modal
             ********/

            document.querySelector(".modal-title").innerText = "Win"
            document.querySelector(".modal").style.display = "block"

            end_game()

        } else if (points.every(k => k.dropped)) {

            /*******
             * L'utente ha piazzato tutti i blocchi ma non tutti nel punto giusto
             ********/

            document.querySelector(".modal-title").innerText = "Try again"

            end_game()

        } else {
            console.log("Still trying")

            /*******
             * L'utente non ha ancora piazzato tutti i blocchi
             ********/

        }
    }

    var timer, countdown

    function reset_shapes() {
        interact('.drag-drop').unset()
        document.querySelectorAll(".drag-drop").forEach(e => {
            e.removeAttribute("style")
            e.removeAttribute("data-y")
            e.removeAttribute("data-x")
        })
    }

    function start_countdown() {
        var duration = 20,
            count = document.querySelector("#countdown")
        count.innerHTML = duration
        countdown = setInterval(() => count.innerHTML = --duration, 1000)
        timer = setTimeout(() => {

            /*******
             * Il tempo è finito
             ********/

            document.querySelector(".modal-title").innerText = "Time's up"
            end_game()
        }, 1000 * duration)
    }

    function end_game() {
        clearInterval(countdown)
        clearTimeout(timer)
        document.querySelector(".modal").style.display = "block"
    }
}