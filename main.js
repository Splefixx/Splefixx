function init()
{
    const canvas = document.getElementById('TitleCanvas');

const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight*0.3;



ctx.beginPath();

ctx.fillStyle = 'red';
ctx.font = 'bold ' + canvas.height * 0.5 + 'px fredoka-one'
ctx.textBaseline = 'middle';
ctx.textAlign = 'center';

ctx.fillText('SPLEFIX DEV', canvas.width / 2, canvas.height / 2);

const pixelDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);

let points = [];
let originalPoints = [];
let colors = [];

const data = pixelDataObj.data;

//let prevIndexPoint = -4

let dotSpacing = 1;
let prevX = -300;
let prevY = -300;
for (let y = 0; y < canvas.height; ++y)
{
    for (let x = 0; x < canvas.width; ++x)
    {
        const i = (y * canvas.width + x) * 4;

        if (i >= data.length) break;

        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];

        if (r === 255 && g === 0 && b === 0 && a === 255) {
            let dx = x - prevX;
            let dy = y - prevY;

            if (dx < dotSpacing && dy < dotSpacing) continue; //Math.sqrt(dx*dx+dy*dy) < dotSpacing) continue;

            points.push([x, y]);
            originalPoints.push([x, y]);
            colors.push([255, 255, 255]);
            prevX = x;
            prevY = y;
        }
    }
}

ctx.clearRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = 'red';
for (let i = 0; i < points.length; ++i)
{
    ctx.beginPath();
    ctx.arc(points[i][0], points[i][1], 1.3, 0, Math.PI*2);
    ctx.fill();
}

const mouse = {
    x: undefined,
    y: undefined,
    radius: 15
};

canvas.addEventListener('mouseleave', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

function getNearbyDots()
{
    let dots = [];

    for (let i = 0; i < points.length; ++i)
    {
        const point = points[i];
        const dx = point[0] - mouse.x;
        const dy = point[1] - mouse.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        

        if (dist > mouse.radius) continue;

        dots.push(i);
    }

    return dots;
}

let becomingRed = true;

function DepartDots()
{
    if (mouse.x === undefined || mouse.y === undefined) return;
    
    const nearbyDots = getNearbyDots();

    for (let i = 0; i < nearbyDots.length; ++i)
    {
        let point = points[nearbyDots[i]];

        const dx = point[0] - mouse.x;
        const dy = point[1] - mouse.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        
        if (dist === 0.0)
        {
            
            continue;
        }

        point[0] += dx;
        point[1] += dy;
        const c = (becomingRed) ? [255, 0, 0] : [255, 255, 255];
        const c2 = colors[nearbyDots[i]];
        colors[nearbyDots[i]] = c;
        /*colors[nearbyDots[i]] = [
            lerp(c2[0], c2[0] + (c[0]-c2[0]), .5),
            lerp(c2[1], c2[1] + (c[1]-c2[1]), .5),
            lerp(c2[2], c2[2] + (c[2]-c2[2]), .5),
        ]*/
    }
}

canvas.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;

    DepartDots();

    
});

function lerp(a, b, t)
{
    return a + (b-a) * t;
}

const fps = 1.0/60.0;
function animate() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //ctx.fillStyle = 'red';

    
    let countSameColor = 0;
    let colorMatch = (becomingRed) ? [255, 0, 0] : [255, 255, 255];
    
    for (let i = 0; i < points.length; ++i)
    {
        if (colors[i][0] === colorMatch[0] && colors[i][1] === colorMatch[1] && colors[i][2] === colorMatch[2])
        {
            countSameColor += 1;
        }
        let origPoint = originalPoints[i];

        let dx = origPoint[0] - points[i][0];
        let dy = origPoint[1] - points[i][1];

        const t = fps * 3;
        const bakeT = t;//1 - Math.sqrt(1 - (t*t));

        points[i][0] = lerp(points[i][0], points[i][0] + dx, bakeT);
        points[i][1] = lerp(points[i][1], points[i][1] + dy, bakeT);

        ctx.fillStyle = 'rgb('+colors[i][0]+', '+colors[i][1]+', '+colors[i][2]+')';
        ctx.beginPath();
        ctx.arc(points[i][0], points[i][1], 1.3, 0, Math.PI*2);
        ctx.fill();
    }

    if (countSameColor >= points.length)
    {
        becomingRed = !becomingRed;
    }

    /*for (let i = 0; i < points.length; ++i)
    {
        // try make them go to their original positions
        let point = points[i];
        let origPoint = originalPoints[i];

        let dx = origPoint[i][0] - points[i][0];
        let dy = origPoint[i][1] - points[i][1];

        //point[i][0] = point[i][0] + dx * fps;
        //point[i][1] = point[i][1] + dy * fps;

        ctx.beginPath();
        ctx.arc(points[i][0], points[i][1], 1.3, 0, Math.PI*2);
        ctx.fill();
    }*/

    requestAnimationFrame(animate);
}

animate();
}

init();

window.addEventListener('resize', function() {
    init();
});
