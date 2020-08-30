function main() {
    const canvas = document.querySelector("#glCanvas");
    const mygl = new WebGL(canvas);
    const objects = [
        new Rect(0.0, 0.0, 1.0, 2.0, [1.0, 0.0, 0.0, 1.0]), 
        new Rect(0.0, 0.0, 2.0, 1.0, [0.0, 0.0, 1.0, 1.0])
    ];
    mygl.render(objects);
}