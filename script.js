import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';

const PARAMS = {
  seed: 0, // apenas afeta o calcQuad e generate
  leafSize: 4,
  angleMargin: 45,
  showGrid: true,
  gridSize: 30,
  sub1: true,
  sub2: true,
  sub3: true,
  sub4: false,
  age: 100,
  loading: false,
  strokeWeight: 4,
  treeNumber: 1
};

var amount = 30;
var gridInfo = "";
var trees = [];
var treeInfo;
var resultFrames = [];
var reset = false;
var animating = false;
var ageBeforeLoad = -1;
var loadedParams = {
  seed: 0,
  treeNumber: 1,
  leafSize: 4,
  angleMargin: 45,
  gridSize: 30,
  strokeWeight: 4,
  sub1: true,
  sub2: true,
  sub3: true,
  sub4: false,
  age: 100
};

const pane = new Pane({ title: 'Parâmetros' });
pane.addBinding(PARAMS, 'seed', { label: "Semente", step: 1 }).on('change', () => { reset = true; });
pane.addBinding(PARAMS, 'treeNumber', { label: "Nº Árvores", min: 1, max: 7, step: 1 }).on('change', () => { reset = true; });

const treeFolder = pane.addFolder({ title: "Árvore" });
treeFolder.addBinding(PARAMS, 'leafSize', { label: "Folhagem", min: 1, max: 10, step: 1 }).on('change', () => { reset = true; });
treeFolder.addBinding(PARAMS, 'angleMargin', { label: "Ângulo", min: 0, max: 90, step: 1 }).on('change', () => { reset = true; });

const filterFolder = pane.addFolder({ title: "Filtro" });
filterFolder.addBinding(PARAMS, 'showGrid', { label: "Mostrar" }).on('change', () => {
  if(PARAMS.showGrid) {
    reset = true;
    showAge.disabled = true;
    filterType.hidden = false;
    sizeBind.hidden = false;
    espessura.hidden = false;
    sub1.hidden = false;
    sub2.hidden = false;
    sub3.hidden = false;
    sub4.hidden = false;
  } else {
    showAge.disabled = false;
    filterType.hidden = true;
    sizeBind.hidden = true;
    espessura.hidden = true;
    sub1.hidden = true;
    sub2.hidden = true;
    sub3.hidden = true;
    sub4.hidden = true;
  }
});
const filterType = filterFolder.addBlade({
  view: 'list',
  label: 'Tipo',
  options: [
    {text: 'Blocos', value: 'block'},
    {text: 'Verde e Marrom', value: 'nature'},
    {text: 'Maioria', value: 'majority'},
  ],
  value: 'nature'
}).on('change', () => { reset = true; });
const sizeBind = filterFolder.addBinding(PARAMS, 'gridSize', { label: "Tamanho", min: 20, max: 100, step: 1 }).on('change', () => { reset = true; });
const espessura = filterFolder.addBinding(PARAMS, 'strokeWeight', { label: "Espessura", min: 0, max: amount/2, step: 1 }).on('change', () => { reset = true; });
const sub1 = filterFolder.addBinding(PARAMS, 'sub1', { label: "Sem Divisão" }).on('change', () => { reset = true; });
const sub2 = filterFolder.addBinding(PARAMS, 'sub2', { label: "Divido 1/2" }).on('change', () => { reset = true; });
const sub3 = filterFolder.addBinding(PARAMS, 'sub3', { label: "Divido 1/3" }).on('change', () => { reset = true; });
const sub4 = filterFolder.addBinding(PARAMS, 'sub4', { label: "Divido 1/4" }).on('change', () => { reset = true; });

const ageFolder = pane.addFolder({ title: "Crescimento" });
const showAge = ageFolder.addBinding(PARAMS, 'age', { min: 0, max: 100, step: 1, label: "Idade", disabled: true }).on('change', () => { ageBeforeLoad = PARAMS.age; });
const loadBtn = ageFolder.addButton({ title: 'Carregar Animação' }).on('click', () => { resultFrames = []; PARAMS.loading = true; });
const growBtn = ageFolder.addButton({ title: 'Animar Crescimento', disabled: true }).on('click', () => { animating = true; PARAMS.age = 0; showAge.disabled = true; });

// commit:
// - trocou os inputs HTML pelo Tweakpane
// - adicionou a opção de tamanho de folhagem
// - trocou a animação em loop por animação de crescimento
// - otimizou o carregamento ao carregar a árvore inteira antes de animá-la
// - agora pode escolher o tamanho do grid
//
// extra:
// - opção de qualidade de animação (de 2 em 2 ou 3 em 3 ao invés de 1 em 1)
//
// descontinuado:
// - pixel perfect
// - filtro branco

new p5((p) => {
  let temp;
  let iterations = 101;
  let chunkSize = 1;
  let currentIndex = 0;
  let doneLoading = true;

  p.heavy = () => {
    if(currentIndex < iterations) {
      let endIndex = Math.min(currentIndex + chunkSize, iterations);
      for (let i = currentIndex; i < endIndex; i++) {
        p.print("Carregando árvore "+currentIndex);
        PARAMS.age = i; // atualiza a idade para carregar a árvore em todas as suas etapas, facilitando a animação posteriormente
        p.tree(p); // mostra as árvores de acordo com os L-systems gerados com a função generate() no setup, e atualiza treeInfo
        p.grid(p); // desenha grid de acordo com treeInfo que foi atualizado acima. essa etapa demora porque confere muitos pixels
        resultFrames.push(p.get()); // insere no array apenas a imagem gerada pelo grid acima
      }
      currentIndex += chunkSize;
      if(resultFrames.length > 100) {
        console.log("Árvore carregada com sucesso!");
        loadedParams.seed = PARAMS.seed;
        loadedParams.treeNumber = PARAMS.treeNumber;
        loadedParams.leafSize = PARAMS.leafSize;
        loadedParams.angleMargin = PARAMS.angleMargin;
        loadedParams.gridSize = PARAMS.gridSize;
        loadedParams.strokeWeight = PARAMS.strokeWeight;
        loadedParams.sub1 = PARAMS.sub1;
        loadedParams.sub2 = PARAMS.sub2;
        loadedParams.sub3 = PARAMS.sub3;
        loadedParams.sub4 = PARAMS.sub4;
        loadedParams.age = PARAMS.age;

        showAge.disabled = false;
        loadBtn.disabled = true;
        growBtn.disabled = false;
        PARAMS.age = ageBeforeLoad;
        doneLoading = true;
      } else setTimeout(p.heavy, 0);
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(1); // garante que o desenho seja o mesmo independente da plataforma, visto que mobile tem resoluções maiores
    p.calcQuad(); // calcula uma vez só as divisões para cada quadrado do grid da tela, de acordo com a seed
    p.generate(180); // cria de fato as árvores (com tamanho máximo de 180) e armazena as informações em L-systems

    temp = p.createGraphics(p.windowWidth, p.windowHeight);
    p.tree(temp);
    p.grid(temp);
    resultFrames.push(temp.get());
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    reset = true;
  }

  // função antiga que foi movida para p.heavy
  // p.treeLoad = () => {
  //   resultFrames = [];
  //   temp = p.createGraphics(p.windowWidth, p.windowHeight);
  //   for(let f = 0; f <= 100; f++) {
  //     p.print("Carregando a árvore na idade "+f+"...");
  //     PARAMS.age = f;
  //     p.tree(temp);
  //     p.grid(temp);
  //     resultFrames.push(temp.get());
  //   }
  //   PARAMS.loading = false;
  // }

  p.draw = () => {
    // confere se alguma árvore já foi carregada, e se os parâmetros estiverem certos, reativa os botões de crescimento/idade
    if(resultFrames.length >= 100 && ageBeforeLoad != -1) {
      if(loadedParams.seed == PARAMS.seed &&
         loadedParams.treeNumber == PARAMS.treeNumber &&
         loadedParams.leafSize == PARAMS.leafSize &&
         loadedParams.angleMargin == PARAMS.angleMargin &&
         loadedParams.strokeWeight == PARAMS.strokeWeight &&
         loadedParams.gridSize == PARAMS.gridSize &&
         loadedParams.sub1 == PARAMS.sub1 &&
         loadedParams.sub2 == PARAMS.sub2 &&
         loadedParams.sub3 == PARAMS.sub3 &&
         loadedParams.sub4 == PARAMS.sub4) {
        showAge.disabled = false;
        loadBtn.disabled = true;
        growBtn.disabled = false;
      }
    }

    if(reset) { // atualiza mesmo se não estiver mostrando o grid, para atualizar o generate da árvore
      // garante que a árvore estará de acordo com a seed
      p.generate(180);

      if(PARAMS.showGrid) {
        p.calcQuad(); // garante que as subdivisões estarão de acordo com a seed

        // desativa mudança de idade/crescimento, exige que o usuário faça o carregamento da árvore nova
        showAge.disabled = true;
        loadBtn.disabled = false;
        growBtn.disabled = true;
        
        // atualiza o grid da árvore apenas na idade atual
        temp = p.createGraphics(p.windowWidth, p.windowHeight);
        p.tree(temp);
        p.grid(temp);
        resultFrames[PARAMS.age] = temp.get();
      }

      reset = false;
    }

    if(animating) {
      if(PARAMS.age < ageBeforeLoad)
        PARAMS.age++;
      else {
        showAge.disabled = false;
        animating = false;
      }
    } 

    p.tree(p); // mostra a árvore atual de acordo com o L-system gerado com a função generate()

    // mostra o grid colorido de acordo com resultFrames, que foi preenchido no carregamento
    // apenas mostra o grid se a checkbox estiver ativa, e se tiver alguma imagem salva no array para mostrar
    if(PARAMS.showGrid && resultFrames.length > 0) {
      if(resultFrames.length == 1) { // caso o array só tenha uma imagem, mostre ela
        p.image(resultFrames[0], 0, 0);
      }
      else // senão, mostre de acordo com PARAMS.age
        p.image(resultFrames[PARAMS.age], 0, 0);
    }

    // círculo para testar a velocidade do código
    // p.fill(255);
    // p.circle(p.mouseX, p.mouseY, 50);

    if(PARAMS.loading) {
      doneLoading = false;
      ageBeforeLoad = PARAMS.age;
      currentIndex = 0;
      showAge.disabled = true;
      loadBtn.disabled = true;
      growBtn.disabled = true;
      p.heavy();
      PARAMS.loading = false;
    }
    if(!doneLoading) {
      let textWidth = p.textWidth("Carregando, por favor espere...");
      p.fill(0);
      p.rectMode(p.CENTER);
      p.rect(p.width/2, p.height/2, textWidth+20, 36+20);
      p.fill(255);
      p.textSize(36);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Carregando, por favor espere...", p.width/2, p.height/2);
    }
  }

  p.calcQuad = () => {
    p.randomSeed(PARAMS.seed);
    gridInfo = "";
    let gridSize = p.int(p.width/amount);
    gridSize = PARAMS.gridSize;

    let availableSubs = [];
    if(PARAMS.sub1) availableSubs.push("0");
    if(PARAMS.sub2) availableSubs.push("Q");
    if(PARAMS.sub3) availableSubs.push("t", "h", "r", "e");
    if(PARAMS.sub4) availableSubs.push("f", "o", "u", "R");
    if(availableSubs == []) availableSubs.push("x"); // se a pessoa desativar todos as divisões, não vai mostrar nada

    // o loop abaixo adiciona um tom de verde e um tom de bege para cada subdivisão possível do grid
    // e registra isso em formato String em gridInfo, para ser acessado posteriormente em grid()
    for (let x = 0; x < p.width; x += gridSize) {
      for (let y = 0; y < p.height; y += gridSize) {
        let isQuad = p.random(availableSubs);
        gridInfo = gridInfo + isQuad;
        for (let c = 0; c < 8; c++) {
            let greenColor = p.random(["1", "2", "3"]);
            gridInfo = gridInfo + greenColor;
            let beigeColor = p.random(["1", "2"]);
            gridInfo = gridInfo + beigeColor;
        }
      }
    }
  }
  
  p.generate = (l) => {
    p.randomSeed(PARAMS.seed);
    trees = [];
    for(let arv = 0; arv < 7; arv++) {
      let branchinfo = [{
        type: "branch",
        size: l,
        ang: p.PI/2,
        visible: true,
        fresh: true
      }];
      for(let bg = 0; bg < 6; bg++) {
        let newinfo = [];
        for (var i = 0; i < branchinfo.length; i++) {
          let current = branchinfo[i];
          if(current.fresh && current.visible) {
            current.fresh = false;
            newinfo.push(current);
            for(let bn = 0; bn < 4; bn++) {
              let chance = [true, false];
              if(bn == 1 || bn == 2) chance = 0.95;
              if(bn == 0 || bn == 3) chance = 0.2;
              let newBranch = {
                type: "branch",
                size: current.size * p.random(0.6, 0.85),
                ang: p.random(p.PI/4 * bn, p.PI/4 + p.PI/4 * bn),
                visible: p.random() < chance ? true : false,
                fresh: p.random() < chance ? true : false
              };
              if(newBranch.visible) {
                newinfo.push({type: "push"});
                newinfo.push(newBranch);
                newinfo.push({type: "pop"});
              }
            }
          } else {
            newinfo.push(current);
          }
        }
        branchinfo = newinfo;
      }
      trees.push(branchinfo);
    }
  }

  p.tree = (canvas) => {
    canvas.background(0);

    trees.forEach((t, ti) => {
      if(PARAMS.treeNumber > ti) {
        canvas.push();
        let positions = [p.width/2, p.width/4, p.width*3/4, p.width*3/8, p.width*5/8, p.width*1/8, p.width*7/8]
        canvas.translate(positions[ti], p.height);
        t.forEach((branch, bi) => {
          if(branch.type == "branch") {
            let mappedAge = p.map(PARAMS.age, 0, 100, 0.12, 1);
            let agedSize = branch.size * mappedAge;
            agedSize *= p.map(p.int((ti+1)/2), 0, 3, 1, 0.5);
            canvas.rectMode(p.CENTER); canvas.noStroke();
            if(agedSize > 20) {
              canvas.fill(200, 120, 50);
              let isLast = false;
              if(t[bi+1] && t[bi+1].type == "pop") isLast = true;
              let mappedAngle = p.map(branch.ang, 0, p.PI, p.radians(PARAMS.angleMargin), p.PI-p.radians(PARAMS.angleMargin));
              canvas.rotate(mappedAngle - p.PI/2);
              canvas.rect(0, -agedSize/2, agedSize/3, agedSize);
              canvas.translate(0, -agedSize);
              if(isLast){
                canvas.fill("green");
                canvas.square(0, 0, 20*PARAMS.leafSize*mappedAge);
              }
            }
            else {
              canvas.fill("green");
              canvas.square(0, 0, 20*PARAMS.leafSize*mappedAge);
            }
          }
          else if(branch.type == "push") canvas.push();
          else if(branch.type == "pop") canvas.pop();
        });
        canvas.pop();
      }
    });

    treeInfo = canvas.get();
    treeInfo.loadPixels();
  }

  p.grid = (canvas) => {
    canvas.background(0);
    canvas.rectMode(p.CORNER);
    let gridSize = p.int(p.width/amount);
    gridSize = PARAMS.gridSize;
    
    for (let x = 0; x < p.width; x += gridSize) {
      for (let y = 0; y < p.height; y += gridSize) {
        let foundColors = [];
        
        for (let i = 0; i < gridSize; i++) {
            foundColors[i] = [];
            for (let j = 0; j < gridSize; j++) {
                let px = x + i;
                let py = y + j;
    
                if (px < treeInfo.width && py < treeInfo.height) {
                    let index = (px + py * treeInfo.width) * 4;
                    let r = treeInfo.pixels[index];
                    let g = treeInfo.pixels[index + 1];
                    let b = treeInfo.pixels[index + 2];
                    if(false) { // pixelPerfect.checked()
                        if(r == 0 && g == 128 && b == 0) {
                            foundColors[i][j] = 1;
                        } else if(r == 200 && g == 120 && b == 50) {
                            foundColors[i][j] = 2;
                        } else foundColors[i][j] = 0;
                    } else {
                        if(g > r) {
                            foundColors[i][j] = 1;
                        } else if(r != 0) {
                            foundColors[i][j] = 2;
                        } else foundColors[i][j] = 0;
                    }
                }
            }
        }
        
        // 1 because of the subdiv type, 2 because of green and beige, 8 because there's a max amount of 8 sub-squares
        let index = (x/gridSize + y/gridSize * p.int(p.width / gridSize)) * (1 + 2*8);
        
        canvas.push();
            // ajusta o y do grid para se alinhar na parte debaixo da tela
            canvas.translate(0, p.height%gridSize);
            
            if(PARAMS.sub2 && gridInfo[index] == "Q") {
                p.drawSquare(canvas, foundColors, x, y, x, y, gridSize/2, 0);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/2, y, gridSize/2, 1);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/2, gridSize/2, 2);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/2, y+gridSize/2, gridSize/2, 3);
            } else if(PARAMS.sub4 && gridInfo[index] == "f") {
                p.drawSquare(canvas, foundColors, x, y, x, y, gridSize/4, 0);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4, y, gridSize/4, 1);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/2, y, gridSize/4, 2);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4*3, y, gridSize/4, 3);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/4, gridSize/4, 4);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/2, gridSize/4, 5);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/4*3, gridSize/4, 6);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4, y+gridSize/4, gridSize/4*3, 7);
            } else if(PARAMS.sub4 && gridInfo[index] == "o") {
                p.drawSquare(canvas, foundColors, x, y, x, y, gridSize/4, 0);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4, y, gridSize/4, 1);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/2, y, gridSize/4, 2);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4*3, y, gridSize/4, 3);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4*3, y+gridSize/4, gridSize/4, 4);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4*3, y+gridSize/2, gridSize/4, 5);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4*3, y+gridSize/4*3, gridSize/4, 6);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/4, gridSize/4*3, 7);
            } else if(PARAMS.sub4 && gridInfo[index] == "u") {
                p.drawSquare(canvas, foundColors, x, y, x, y, gridSize/4, 0);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4, y+gridSize/4*3, gridSize/4, 1);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/2, y+gridSize/4*3, gridSize/4, 2);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4*3, y+gridSize/4*3, gridSize/4, 3);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/4, gridSize/4, 4);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/2, gridSize/4, 5);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/4*3, gridSize/4, 6);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4, y, gridSize/4*3, 7);
            } else if(PARAMS.sub4 && gridInfo[index] == "R") {
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4*3, y+gridSize/4*3, gridSize/4, 0);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/4*3, gridSize/4, 1);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4, y+gridSize/4*3, gridSize/4, 2);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/2, y+gridSize/4*3, gridSize/4, 3);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4*3, y, gridSize/4, 4);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4*3, y+gridSize/4, gridSize/4, 5);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/4*3, y+gridSize/2, gridSize/4, 6);
                p.drawSquare(canvas, foundColors, x, y, x, y, gridSize/4*3, 7);
            } else if(PARAMS.sub3 && gridInfo[index] == "t") {
                p.drawSquare(canvas, foundColors, x, y, x, y, gridSize/3, 0);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3, y, gridSize/3, 1);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3*2, y, gridSize/3, 2);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/3, gridSize/3, 3);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/3*2, gridSize/3, 4);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3, y+gridSize/3, gridSize/3*2, 5);
            } else if(PARAMS.sub3 && gridInfo[index] == "h") {
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3*2, y+gridSize/3*2, gridSize/3, 0);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3, y+gridSize/3*2, gridSize/3, 1);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3*2, y, gridSize/3, 2);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3*2, y+gridSize/3, gridSize/3, 3);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/3*2, gridSize/3, 4);
                p.drawSquare(canvas, foundColors, x, y, x, y, gridSize/3*2, 5);
            } else if(PARAMS.sub3 && gridInfo[index] == "r") {
                p.drawSquare(canvas, foundColors, x, y, x, y, gridSize/3, 0);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3, y, gridSize/3, 1);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3*2, y, gridSize/3, 2);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3*2, y+gridSize/3, gridSize/3, 3);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3*2, y+gridSize/3*2, gridSize/3, 4);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/3, gridSize/3*2, 5);
            } else if(PARAMS.sub3 && gridInfo[index] == "e") {
                p.drawSquare(canvas, foundColors, x, y, x, y, gridSize/3, 0);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3, y+gridSize/3*2, gridSize/3, 1);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3*2, y+gridSize/3*2, gridSize/3, 2);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/3, gridSize/3, 3);
                p.drawSquare(canvas, foundColors, x, y, x, y+gridSize/3*2, gridSize/3, 4);
                p.drawSquare(canvas, foundColors, x, y, x+gridSize/3, y, gridSize/3*2, 5);
            } else if(PARAMS.sub1 && gridInfo[index] == "0")
                p.drawSquare(canvas, foundColors, x, y, x, y, gridSize, 0);
        canvas.pop();
      }
    }
  }

  p.drawSquare = (canvas, colorArray, x, y, tx, ty, s, ind) => {
      let gridSize = p.int(p.width/amount);
      gridSize = PARAMS.gridSize;
      let index = (x/gridSize + y/gridSize * p.int(p.width / gridSize)) * (1 + 2*8);
      let greens = ["#03FF00", "#02C600", "#028E0D"];
      let beiges = ["#DBB77D", "#FCF2C8"];
  
      let atLeastOne = {green: false, brown: false};
      let majority = [0, 0, 0];
  
      let checkStart, checkEnd;
      if(filterType.value == "block") {
         checkStart = [0, 0];
         checkEnd = [gridSize, gridSize];
      } else {
          checkStart = [p.int(tx-x), p.int(ty-y)];
          checkEnd = [p.int(tx-x+s), p.int(ty-y+s)];
      }
  
      for (let i = checkStart[0]; i < checkEnd[0]; i++) {
          for (let j = checkStart[1]; j < checkEnd[1]; j++) {
              if((colorArray[i][j] != undefined && filterType.value == "majority") ||
                  (colorArray[i][j] && filterType.value == "nature") || filterType.value == "block") {  
                  if(colorArray[i][j] === 1) {
                      majority[1]++;
                      atLeastOne.green = true;
                  } else if(colorArray[i][j] === 2) {
                      majority[2]++;
                      atLeastOne.brown = true;
                  } else if(colorArray[i][j] === 0) {
                      majority[0]++;
                  }
              }
          }
      }
  
      let colorToPaint = 0;
  
      if(filterType.value == "block") {
          if(atLeastOne.green) colorToPaint = greens[p.int(gridInfo[index+1])-1];
          else if(atLeastOne.brown) colorToPaint = beiges[p.int(gridInfo[index+2])-1];
      } else {
          if(majority[1] > majority[2] && majority[1] > majority[0])
              colorToPaint = greens[p.int(gridInfo[index+1+2*ind])-1];
          else if(majority[2] > majority[0] && majority[2] > majority[1])
              colorToPaint = beiges[p.int(gridInfo[index+2+2*ind])-1];
      }
  
      // if(weight.value() > 0) {
      //     stroke(0);
      //     strokeWeight(weight.value());
      // } else {
      //     noStroke();
      // }
      canvas.stroke(0); canvas.strokeWeight(PARAMS.strokeWeight);

      canvas.fill(colorToPaint);
      // if(clearGrid.checked())
      // canvas.fill(255);
      canvas.square(tx, ty, s);
  }
});