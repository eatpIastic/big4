/// <reference types="../CTAutocomplete" />

import { registerWhen } from "../BloomCore/utils/Utils";
import { getPath, runPath } from "./arrows";
import RenderLib from "../RenderLib";

const C08PacketPlayerBlockPlacement = Java.type("net.minecraft.network.play.client.C08PacketPlayerBlockPlacement")
const C03PacketPlayer = Java.type("net.minecraft.network.play.client.C03PacketPlayer")
const C06PacketPlayerPosLook = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C06PacketPlayerPosLook")
const C05PacketPlayerLook = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C05PacketPlayerLook")

const validSpots = new Set(["-14, 21, -70", "-14, 21, -57", "-14, 33, -70", "-14, 33, -57"])
const targets = [[0,0],[0,2],[0,4],[-2,0],[-2,2],[-2,4],[-4,0],[-4,2],[-4,4]]

let canShoot = false;
let toDraw = [];
let pattern = [];
let currentSpot = null;
let currentBlock = null;
let startTime = null;
let getNextLook = true;
let lastSentLook = null;
let startAt = 0;
let invincibility = {"bonzo": null, "spirit": null, "phoenix": null};


registerWhen(register("renderWorld", () => {
    drawTargets();
    toDraw.forEach(d => runPath(d));
}), () => currentSpot !== null);


register("packetSent", (packet) => {
    if (getNextLook && (packet instanceof C05PacketPlayerLook || packet instanceof C06PacketPlayerPosLook)) {
        lastSentLook = [packet.func_149470_h(), packet.func_149462_g()];
        getNextLook = false;
    }
}).setFilteredClass(C03PacketPlayer)


register("packetSent", (packet, event) => {
    getNextLook = true;
    if(Player.getHeldItem()?.getRegistryName() !== "minecraft:bow") {
        return;
    }

    currentSpot = `${Math.floor(Player.getX())}, ${Math.floor(Player.getY())}, ${Math.floor(Player.getZ())}`;
    canShoot = true;

    if(!validSpots.has(currentSpot)) {
        reset();
        return;
    }

     if(!pattern.length) {
        generatePattern();
        currentBlock = 0;
        startTime = Date.now();
    }
}).setFilteredClass(C08PacketPlayerBlockPlacement)


register("step", () => {
    if(!canShoot) return;
    canShoot = false;
    getNextLook = true;
    startAt = 0;

    let randomYaw = Math.random() * .5 - .5;
    let randomPitch = Math.random() * .5 - .5;
    let paths = []

    paths.push(getPath(randomYaw, randomPitch, lastSentLook));
    paths.push(getPath(-5, 0, lastSentLook));
    paths.push(getPath(4, 0, lastSentLook))

    if(!paths || !paths.length) {
        return;
    }

    toDraw = [...paths]
    World.playSound("random.bow", 1, 1);

    let hitCoords = [];
    paths.forEach(p => {
        if(!p || !p.length) return;
        hitCoords.push([p[p.length-1].x, p[p.length-1].y, p[p.length-1].z])
    });
    if(!hitCoords || !hitCoords.length) return;
    for(let i=0; i<hitCoords.length; i++) {
        hitCoords[i] = [hitCoords[i][0], hitCoords[i][1]-1, hitCoords[i][2]]
    }

    if(hitCoords.some(coords => checkTargetHit(coords[0], coords[1], coords[2]))) {
        currentBlock++;
        if(currentBlock==pattern.length) {
            ChatLib.chat(`Device Complete in ${((Date.now()-startTime)/1000).toFixed(2)}`);
            reset();
        }
        else {
            if(hitCoords.some(coords => checkTargetHit(coords[0], coords[1], coords[2]))) {
                currentBlock++;
                if(currentBlock==pattern.length) {
                    ChatLib.chat(`Device Complete in ${((Date.now()-startTime)/1000).toFixed(2)}`);
                    reset();
                }
            }
        }
    }
}).setFps(4);


register("worldLoad", () => reset());


const generatePattern = () => {
    pattern = shuffle(targets);
    currentBlock = 0;
}


const shuffle = (bigarray) => {
    let array = [...bigarray];
    let currentIndex = array.length;

    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}


const reset = () => {
    canShoot = false;
    lastSentLook = null;
    toDraw = [];
    pattern = [];
    currentSpot = null;
    currentBlock = null;
    startTime = null;
    getNextLook = true;
    lastSentLook = null;
    let invincibility = {"bonzo": null, "spirit": null, "phoenix": null};
}


const checkTargetHit = (aX, aY, aZ) => {
    if(currentSpot === null || currentBlock === null || !pattern.length || !pattern[currentBlock]) {
        return;
    }
    let [x, y, z] = currentSpot.split(",");
    x = parseFloat(x) + 1.6;
    z = parseFloat(z) + .5;
    y = parseFloat(y)
    x += 16
    y += 2
    z -= 5

    y += pattern[currentBlock][0]
    z += pattern[currentBlock][1]

    return Math.floor(x) == Math.floor(aX) && Math.floor(y-1) == Math.floor(aY) && Math.floor(z) == Math.floor(aZ);
}


const drawTargets = () => {
    if(currentSpot === null || currentBlock === null || !pattern.length || !pattern[currentBlock]) {
        return;
    }

    for(let i = 0; i <= currentBlock; i++) {
        let [x, y, z] = currentSpot.split(",");
        x = parseFloat(x) + 17.5;
        z = parseFloat(z) - 4.5;
        y = parseFloat(y) + 2;

        y += pattern[i][0];
        z += pattern[i][1];

        RenderLib.drawInnerEspBox(x, y, z, 1, 1, i==currentBlock ? 0 : 1, i==currentBlock ? 1 : 0, 0, i==currentBlock ? .75 : .25, 1);
    }
}

