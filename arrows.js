export const getPath = (yawChange, pitchChange, useLook) => {
    const player = Player.getPlayer();
    const path = [];
    const lastLook = useLook;
    if(!lastLook || !lastLook.length) return;
    const bowYaw = lastLook[1] + yawChange;

    let arrowPosX = Player.getLastX()
    + (Player.getX() - Player.getLastX()) * 0.5
    - Math.cos(toRadians(bowYaw)) * 0.16;

    let arrowPosY = Player.getLastY()
    + (Player.getY() - Player.getLastY()) * 0.5
    + player.func_70047_e() - 0.1;

    let arrowPosZ = Player.getLastZ()
    + (Player.getZ() - Player.getLastZ()) * 0.5
    - Math.sin(toRadians(bowYaw)) * 0.16;

    let arrowMotionFactor = 0.4;

    let yaw = toRadians(bowYaw);
    let pitch = toRadians(lastLook[0] + pitchChange);

    let arrowMotionX = -Math.sin(yaw) * Math.cos(pitch) * arrowMotionFactor;
    let arrowMotionY = -Math.sin(pitch) * arrowMotionFactor;
    let arrowMotionZ = Math.cos(yaw) * Math.cos(pitch) * arrowMotionFactor;

    let arrowMotion = Math.sqrt(arrowMotionX * arrowMotionX + arrowMotionY * arrowMotionY + arrowMotionZ * arrowMotionZ);

    arrowMotionX /= arrowMotion;
    arrowMotionY /= arrowMotion;
    arrowMotionZ /= arrowMotion;

    let bowPower = 2.5;
    arrowMotionX *= bowPower;
    arrowMotionY *= bowPower;
    arrowMotionZ *= bowPower;

    let gravity = 0.03;
    for(let i = 0; i < 100; i++) {
        let arrowPos = {x: arrowPosX, y: arrowPosY, z: arrowPosZ}
        path.push(arrowPos);

        arrowPosX += arrowMotionX * 0.1;
        arrowPosY += arrowMotionY * 0.1;
        arrowPosZ += arrowMotionZ * 0.1;

        arrowMotionX *= 0.999;
        arrowMotionY *= 0.999;
        arrowMotionZ *= 0.999;

        arrowMotionY -= gravity * 0.1;
        if(floorWorldBlock(arrowPosX, arrowPosY, arrowPosZ)?.type?.getRegistryName() === "minecraft:stained_hardened_clay") {
            arrowPos = {x: arrowPosX, y: arrowPosY, z: arrowPosZ};
            path.push(arrowPos);
            break;
        }
    }
    return path;  
}

export const runPath = (path) => {
    if(!path || !path.length) {
        return;
    }

    for(let i = 0; i < path.length - 1; i++) {
        if(path[i]===undefined || path[i+1]===undefined) return;
        Tessellator.pushMatrix()
        GL11.glLineWidth(5.0);
        GlStateManager.func_179129_p(); // disableCullFace
        GlStateManager.func_179147_l(); // enableBlend
        GlStateManager.func_179112_b(770, 771); // blendFunc
        GlStateManager.func_179132_a(false); // depthMask
        GlStateManager.func_179090_x(); // disableTexture2D
        Tessellator.begin(2, true)
        .pos(path[i].x, path[i].y, path[i].z).tex(0,5)
        .pos(path[i+1].x, path[i+1].y, path[i+1].z).tex(0,5)
        .colorize(0, .3, .8, 1)
        .draw()
        GlStateManager.func_179089_o(); // enableCull
        GlStateManager.func_179084_k(); // disableBlend
        GlStateManager.func_179132_a(true); // depthMask
        GlStateManager.func_179098_w(); // enableTexture2D
        Tessellator.popMatrix()
    }
}

const toRadians = (degrees) => { return degrees * Math.PI / 180.0 };

const floorWorldBlock = (x, y, z) => {
    return World.getBlockAt(Math.floor(x), Math.floor(y), Math.floor(z));
}
