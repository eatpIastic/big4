/// <reference types="../CTAutocomplete" />


import { registerWhen } from "../BloomCore/utils/Utils";
import RenderLib from "../RenderLib";

let session = null;

register("worldLoad", () => {
    session = null;
});


class Big4Game {
    static targets = [[0,0],[0,2],[0,4],[-2,0],[-2,2],[-2,4],[-4,0],[-4,2],[-4,4]];

    constructor() {
        this.invincibility = {
            "bonzo": null,
            "spirit": null,
            "phoenix": null
        };    
        this.currentSpot = `${Math.floor(Player.getX())}, ${Math.floor(Player.getY())}, ${Math.floor(Player.getZ())}`;
        this.pattern = Utils.shuffle(Big4Game.targets);
        this.currentBlock = 0;
    }

    getTargetCoords(i) {
        if (this.currentBlock > this.pattern.length || this.pattern?.[i]?.[0] == null) {
            ChatLib.chat("done");
            session = new Big4Game();
            return;
        }

        let [x, y, z] = this.currentSpot.split(",");
        x = parseFloat(x) + 5.5;
        z = parseFloat(z) + 17.5;
        y = parseFloat(y) + 3;

        y += this.pattern[i][0];
        x -= this.pattern[i][1];

        return `${x},${y},${z}`;
    }

    drawTargets() {
        if (this.currentBlock > this.pattern.length) {
            return;
        }

        for(let i = 0; i <= this.currentBlock; i++) {
            let temp = this.getTargetCoords(i)?.split(",");
            if (!temp) return;
            let [x, y, z] = temp;
            RenderLib.drawInnerEspBox(x, y, z, 1, 1, i==this.currentBlock ? 0 : 1, i==this.currentBlock ? 1 : 0, 0, i==this.currentBlock ? .75 : .25, 1, false);
        }
    }

    drawDev() {
        let [cx, cy, cz] = this.currentSpot.split(",");
        cx = parseFloat(cx) + 0.5;
        cz = parseFloat(cz) + 18;
        cy = parseFloat(cy) - 2;
        for (let dx = 0; dx < 7; dx++) {
            for (let dy = 0; dy < 7; dy++) {
                RenderLib.drawInnerEspBox(cx + dx, cy + dy, cz, 1, 1, dx % 2 == 0 ? .15 : .25, 0, .1, .75, false);
            }
            // RenderLib.drawInnerEspBox(cx + i, cy, cz, 1, 7, i % 2 == 0 ? .1 : .2, 0, .1, .5, false);
        }

        for (let i = 0; i < this.pattern.length; i++) {
            let temp = this.getTargetCoords(i)?.split(",");
            if (!temp) return;
            let [x, y, z] = temp;
            RenderLib.drawInnerEspBox(x, y, z, 1, 1, 0, .5, .5, 1, 1, false);
        }
    }
}


register("command", () => {
    // 0.39768657142149627 146 -74.32016558419377
    session = new Big4Game();
}).setName("big4");

registerWhen(register("renderWorld", () => {
    session.drawDev();
    session.drawTargets();
}), () => session != null);

registerWhen(register("renderEntity", (entity, pos, partialTicks, event) => {
    if (entity.getClassName() != "EntityArrow" || Player.asPlayerMP().distanceTo(entity) > 25) {
        return;
    }
    let [x, y, z] = [Math.trunc(Player.getX()+pos.getX()), Math.trunc(Player.getY()+pos.getY()), Math.trunc(Player.getZ()+pos.getZ())];

    let block = session.getTargetCoords(session.currentBlock);
    if (!block) return;
    let [bx, by, bz] = block.split(",");
    bx = Math.trunc(bx);
    by = Math.trunc(by);
    bz = Math.trunc(bz);

    if (x == bx && y == by && z == bz) {
        session.currentBlock++;
    }
    
}), () => session != null);


class Utils {
    static RenderArrow = Java.type("net.minecraft.client.renderer.entity.RenderArrow");
    
    static shuffle = (bigarray) => {
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


}
