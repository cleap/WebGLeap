// WebGL code from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial

class Rect {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    getPositions() {
        return [
            this.x - this.width/2.0, this.y + this.height/2.0,
            this.x + this.width/2.0, this.y + this.height/2.0,
            this.x - this.width/2.0, this.y - this.height/2.0,
            this.x + this.width/2.0, this.y - this.height/2.0,
        ];
    }

    getColors() {
        // return [
        //     1.0, 1.0, 1.0, 1.0,
        //     1.0, 0.0, 0.0, 1.0,
        //     0.0, 1.0, 0.0, 1.0,
        //     0.0, 0.0, 1.0, 1.0,
        // ];
        return this.color.concat(this.color, this.color, this.color);
    }

    getVertexCount() {
        return 4;
    }
}

class WebGL {
    constructor(canvas) {
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
    
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
    
            varying lowp vec4 vColor;
    
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;
    
        const fsSource = `
            varying lowp vec4 vColor;
    
            void main() {
                gl_FragColor = vColor;
            }
        `;

        this.gl = canvas.getContext("webgl");

        if (this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return null;
        }
    
    
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
        this.shaderProgram = initShaderProgram(this.gl, vsSource, fsSource);
    
        this.programInfo = {
            program: this.shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                vertexColor: this.gl.getAttribLocation(this.shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
            },
        };
    }

    render(objects) {
        var positions = []
        var colors = []
        var vertices = [];
        var obj;
        for (obj of objects) {
            positions = positions.concat(obj.getPositions());
            colors = colors.concat(obj.getColors());
            vertices.push(obj.getVertexCount());
        }

        this.buffers = initBuffers(this.gl, positions, colors);
        drawScene(this.gl, this.programInfo, this.buffers, vertices);
    }
}

function drawScene(gl, programInfo, buffers, vertices) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BUFFER);

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar
    );
    
    const modelViewMatrix = mat4.create();

    mat4.translate(modelViewMatrix,
                   modelViewMatrix,
                   [-0.0, 0.0, -6.0]
    );
    
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
    
    var vertexCount;
    var offset = 0;
    for (vertexCount of vertices) {
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        offset += vertexCount;
    }
}

function initBuffers(gl, positions, colors) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(positions),
                  gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 
                  new Float32Array(colors), 
                  gl.STATIC_DRAW);
    
    return {
        position: positionBuffer,
        color: colorBuffer,
    };
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return shaderProgram;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('an error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}