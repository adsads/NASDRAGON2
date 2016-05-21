var WIDTH = 800;
var HEIGHT = 600;
var CENTER_X = WIDTH/2;
var CENTER_Y = HEIGHT/2;
var RENDERER = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
var STAGE = new PIXI.Container();
var INPUTS = {
  up: false,
  down: false
};
window.addEventListener('keydown', function(e){
  if(e.keyCode == 39) INPUTS.up = true;
  if(e.keyCode == 37) INPUTS.down = true;
});
window.addEventListener('keyup', function(e){
  if(e.keyCode == 39) INPUTS.up = false;
  if(e.keyCode == 37) INPUTS.down = false;
});
var STATE = {
  current: 'level_one',
  mounted: false,
  changeState: function(state){
    STATE.current = state;
    STATE.mounted = false;
    STAGE.removeChildren();
  }
};

stats = new Stats();
document.body.appendChild( stats.domElement );
stats.domElement.style.position = "absolute";
stats.domElement.style.top = "0px";

window.RENDERER = RENDERER;
RENDERER.view.style.border = '1px solid black';
RENDERER.view.style.margin = '0px auto';
RENDERER.view.style.display = 'block';
document.body.appendChild(RENDERER.view);

var Explosion;

function collision(a, b){
  return a.position.x < b.position.x + b.width && a.position.x + a.width > b.position.x && a.position.y < b.position.y + b.height && a.position.y + a.height > b.position.y;
}

PIXI.loader
  .add('spritesheet', 'mc.json')
  .load(onAssetsLoaded);

function onAssetsLoaded(){
  var explosionTextures = [];

  for (var i = 0; i < 26; i++){
    var texture = PIXI.Texture.fromFrame('Explosion_Sequence_A ' + (i+1) + '.png');
    explosionTextures.push(texture);
  }

  Explosion = function(){
    var exp = new PIXI.extras.MovieClip(explosionTextures);
    exp.position.x = 100;
    exp.position.y = 100;
    exp.anchor.x = 0.5;
    exp.anchor.y = 0.5;
    exp.loop = false;
    exp.gotoAndPlay(25);
    return exp;
  }

  requestAnimationFrame(animate);

}
var gameTitle, titleFade, madeBy, madeByFade, madeByFadeOut, titleFadeOut, transition;
STATE.title_screen = function(){
  if(!STATE.mounted){
    STATE.mounted = true;
    gameTitle = new PIXI.Text('NASDRAGON2');
    madeBy = new PIXI.Text('Made By: TOTALLY Austin Salz (Alex Lanzoni with PIXI)');
    titleFade = false;
    gameTitle.style = {
      fill: '#FFFFFF'
    };
    madeBy.style = {
      fill: '#FFFFFF'
    };
    gameTitle.anchor.x = 0.5;
    gameTitle.anchor.y = 0.5;
    gameTitle.position.x = CENTER_X;
    gameTitle.position.y = CENTER_Y;
    madeBy.anchor.x = 0.5;
    madeBy.anchor.y = 0.5;
    madeBy.position.x = CENTER_X;
    madeBy.position.y = CENTER_Y;
    madeBy.alpha = 0.0;
    STAGE.addChild(gameTitle);
    STAGE.addChild(madeBy);
    setTimeout(function(){
      titleFade = true;
    }, 2000);
    window.gameTitle = gameTitle;
    // setTimeout(function(){ STATE.changeState('level_one') }, 5000);
  }

  if(titleFade && gameTitle.alpha > 0){
    gameTitle.alpha -= 0.05;
  }
  if(gameTitle.alpha < 0.001 && !madeByFade){
    madeBy.alpha += 0.05;
  }
  if(madeBy.alpha >= 1 && !madeByFadeOut){
    madeByFade = true;
    madeByFadeOut = true;
    setTimeout(function(){
      titleFadeOut = true;
    }, 2000);
  }

  if(titleFadeOut && madeBy.alpha > 0.001){
    madeBy.alpha -= 0.05;
  }

  if(titleFadeOut && madeBy.alpha < 0.001){
    STATE.changeState('start_screen');
  }

  // debugger

}
var startButton, bunnies = [], startBackground;
STATE.start_screen = function(){
  if(!STATE.mounted){
    RENDERER.backgroundColor = '0xFFFFFF';
    STATE.mounted = true;
    startButton = new PIXI.Text('START');
    startBackground = new PIXI.Graphics();

    for(var i = 0;i<20; i++){
      var bunny = new PIXI.Sprite.fromImage('bunny.png');
      bunny.position.x = Math.random() * WIDTH;
      bunny.position.y = Math.random() * HEIGHT;
      bunny.anchor.x = 0.5;
      bunny.anchor.y = 0.5;
      bunny.speedX = 2 + Math.random() * 10;
      bunny.speedY = 2 + Math.random() * 10;
      bunnies.push(bunny);
      STAGE.addChild(bunny);
    }

    startBackground.beginFill(0x000000, 1);
    startBackground.drawRect(CENTER_X - 50, CENTER_Y - 50, 100, 100);
    startBackground.interactive = true;
    startBackground.on('mousedown', function(){
      STATE.changeState('level_one');
    });

    startButton.style = {
      fill: '#FFFFFF'
    }
    startButton.anchor.x = 0.5;
    startButton.anchor.y = 0.5;
    startButton.position.x = CENTER_X
    startButton.position.y = CENTER_Y
    startButton.interactive = true;
    startButton.on('mousedown', function(){
      STATE.changeState('level_one');
    });
    STAGE.addChild(startBackground);
    STAGE.addChild(startButton);
  }

  bunnies.forEach(function(bunny){
    bunny.position.x += bunny.speedX;
    bunny.position.y += bunny.speedY;
    bunny.rotation += 0.2;
    if(bunny.position.x > WIDTH){
      bunny.speedX *= -1;
    }
    if(bunny.position.y > HEIGHT){
      bunny.speedY *= -1;
    }
    if(bunny.position.x < 0){
      bunny.speedX *= -1;
    }
    if(bunny.position.y < 0){
      bunny.speedY *= -1;
    }
  });
}
var player, bullets = [], health, bunnies = [];
window.bunnies = bunnies;
STATE.level_one = function(){
  if(!STATE.mounted){
    var interval = 1000;
    RENDERER.backgroundColor = '0xFFFFFF';
    STATE.mounted = true;
    player = new PIXI.Sprite.fromImage('player.jpg');
    health = new PIXI.Text('');
    player.position.x = 0;
    player.position.y = CENTER_Y - 25;
    player.scale.x = 0.1;
    player.scale.y = 0.1;
    player.speedY = 5;
    player.health = 5;
    health.text = player.health;
    health.style = {
      fill: '#00FF00'
    }
    window.addEventListener('keydown', function(e){
      if(e.keyCode == 32 || e.keyCode == 179){
        var bullet = new PIXI.Sprite.fromImage('player.jpg');
        bullet.position.x = player.position.x + player.width;
        bullet.position.y = player.position.y + (player.height/2);
        bullet.scale.x = 0.05;
        bullet.scale.y = 0.05;
        bullet.speedX = 10;
        bullets.push(bullet);
        STAGE.addChild(bullet);
      }
    });
    window.player = player;
    STAGE.addChild(player);
    STAGE.addChild(health);
    function go(){
      setTimeout(function(){
        var bunny = new PIXI.Sprite.fromImage('bunny.png');
        bunny.position.x = WIDTH - 50;
        bunny.position.y = HEIGHT * Math.random();
        bunny.speedX = -5;
        bunnies.push(bunny);
        STAGE.addChild(bunny);
        if(interval > 10){
          interval -= 10;
        }
        go();
      }, interval);
    }
    go();
  }

  if(INPUTS.down){
    if((player.position.y + player.height) < HEIGHT){
      player.position.y += player.speedY;
    }else{
      player.position.y = HEIGHT - player.height;
    }
  }
  if(INPUTS.up){
    if(player.position.y > 0){
      player.position.y -= player.speedY;
    }else{
      player.position.y = 0;
    }
  }

  // if(INPUTS.fire){
  //   var bullet = new PIXI.Graphics();
  //   bullet.beginFill(0x000000, 1);
  //   bullet.drawRect(player.position.x + player.width, player.position.y + (player.height/2), 10, 10);
  //   bullet.speedX = 10;
  //   bullets.push(bullet);
  //   STAGE.addChild(bullet);
  // }
  bullets.forEach(function(bullet){
    bullet.position.x += bullet.speedX;
    if(bullet.position.x > WIDTH){
      bullets.splice( bullets.indexOf(bullet), 1 );
      STAGE.removeChild(bullet);
    }
    bunnies.forEach(function(bunny){
      // console.log(bunny, bullet);
      // console.log(bullet.position.x, bullet.position.x + bullet.width, bullet.position.y)
      // debugger

      // if(bullet.position.x > bunny.position.x &&
      //   bullet.position.x < bunny.position.x + bunny.width &&
      //   bullet.position.y > bunny.position.y &&
      //   bullet.position.y < bunny.position.y + bunny.height){
      //   STAGE.removeChild(bunny);
      //   STAGE.removeChild(bullet);
      // }
      // debugger

      if( collision(bullet, bunny) ){
        var explosion = new Explosion();
        explosion.position.x = bunny.position.x;
        explosion.position.y = bunny.position.y;
        STAGE.removeChild(bullet);
        STAGE.removeChild(bunny);
        bullets.splice( bullets.indexOf(bullet), 1 );
        bunnies.splice( bunnies.indexOf(bunny), 1 );
        STAGE.addChild(explosion);
        explosion.gotoAndPlay(0);
      }

    });
  });

  health.position.x = player.position.x + 10;
  health.position.y = player.position.y - 10;
  health.text = player.health;

  bunnies.forEach(function(bunny){
    bunny.position.x += bunny.speedX;
    if(bunny.position.x < -50){
      STAGE.removeChild(bunny);
      bunnies.splice(bunnies.indexOf(bunny), 1);
    }
  });

}

function animate(){
  stats.begin();
  STATE[STATE.current]();
  RENDERER.render(STAGE);
  requestAnimationFrame(animate);
  stats.end();
}
