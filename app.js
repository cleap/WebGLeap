var squareRotation = 0.0;

function main() {
    const canvas = document.querySelector("#glCanvas");
    const mygl = new WebGL(canvas);
    const objects = [
        new Rect(0.0, 0.0, 1.0, 2.0, [1.0, 0.0, 0.0, 1.0]), 
        new Rect(0.0, 0.0, 2.0, 1.0, [0.0, 0.0, 1.0, 1.0])
    ];
    mygl.render(objects);
    
    var then = 0;
    function render(now) {
        now*= 0.001;
        const deltaTime = now - then;
        then = now;

        mygl.render(objects);

        squareRotation += deltaTime;

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}