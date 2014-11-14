var game = new Phaser.Game(600, 600, Phaser.AUTO, 'body');

playState = {
    init: function() {
    },

    preload: function() {
        this.game.load.spritesheet('character', 'assets/character.png');
        this.game.load.image('bullet','assets/bullet.png');
        this.game.load.image('wave','assets/wave.png');
    },

    create: function() {
        this.game.stage.backgroundColor = '#469';
        this.player = game.add.sprite(20, 20, 'character');
        this.player.anchor.setTo(0.5, 0.5);

        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
      
        this.game.input.activePointer.x = this.game.width/2;
        this.game.input.activePointer.y = this.game.height/2 - 100;
        this.playerSpeed = 350;
        this.BULLET_SPEED = 600;
        this.WORLD_SPEED = 1;
        this.E_DRAG = 290;
        this.E_VELO = 300;
        this.player.bulletPool = this.game.add.group();
        this.player.wavePool = this.game.add.group();
        for(var i = 0; i < 100; i++) {
            var bullet = this.game.add.sprite(0, 0, 'bullet');
            this.player.bulletPool.add(bullet);
            bullet.anchor.setTo(0.5, 0.5);
            this.game.physics.enable(bullet, Phaser.Physics.ARCADE);
            bullet.kill();
        }
        this.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.A,
            Phaser.Keyboard.D,
            Phaser.Keyboard.W,
            Phaser.Keyboard.S,
            Phaser.Keyboard.E,
            Phaser.Keyboard.SHIFT
        ]);
        
        this.enemies = this.game.add.group();
        for ( var i = 0; i < 8; i++ ) {
            var enemy = game.add.sprite(20, 20, 'character');
            enemy.anchor.setTo(0.5, 0.5);
            var _x = this.game.rnd.between(100,500);
            var _y = this.game.rnd.between(100,500);
            enemy.reset(_x, _y);
            this.game.physics.enable(enemy, Phaser.Physics.ARCADE);
            this.enemies.add(enemy);
        }
        
    },

    update: function() {
        if (this.input.keyboard.isDown(Phaser.Keyboard.A)) {
            this.player.body.velocity.x = -this.playerSpeed;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.body.velocity.x = this.playerSpeed;
        } else {
            this.player.body.velocity.x = 0;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.W)) {
            this.player.body.velocity.y = -this.playerSpeed;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.player.body.velocity.y = this.playerSpeed;
        } else {
            this.player.body.velocity.y = 0;
        }
        if ( this.input.keyboard.isDown(Phaser.Keyboard.SHIFT) ) {
            this.WORLD_SPEED = 0.1;
        } else {
            this.WORLD_SPEED = 1;
        }

        if ( this.input.keyboard.isDown(Phaser.Keyboard.E) ) {
            console.log('make wave');
            this.wave();
        }
        
        this.player.rotation = this.game.physics.arcade.angleToPointer(this.player);
        if ( this.game.input.activePointer.isDown ) {
            this.shoot();
            console.log(this.player.bulletPool.length);
        }

        this.player.bulletPool.forEachAlive(function(b){
            // b.body.enable = true;
            b.body.x = b.body.prev.x + b.body.deltaX() * this.WORLD_SPEED;
            b.body.y = b.body.prev.y + b.body.deltaY() * this.WORLD_SPEED;
        },this);
        this.enemies.forEachAlive(function(b){
            // b.body.enable = true;
            // console.log(b.body.velocity.x, b.body.drag.x, b.body.deltaX(), this.game.time.elapsed);
            if ( b._waveAffected === true ) {
                b.body.velocity.x+= b.body.drag.x * this.game.time.elapsed/1000 - b.body.drag.x * this.game.time.elapsed/1000 * this.WORLD_SPEED;
                b.body.velocity.y+= b.body.drag.y * this.game.time.elapsed/1000 - b.body.drag.y * this.game.time.elapsed/1000 * this.WORLD_SPEED;
                b.body.x = b.body.prev.x + b.body.deltaX() * this.WORLD_SPEED;
                b.body.y = b.body.prev.y + b.body.deltaY() * this.WORLD_SPEED;
            }
            if ( b.body.velocity.x === 0 && b.body.velocity.y === 0 ) {
                b._waveAffected = false;
            }
        },this);


        // this.updateBulletsVelocity();
        // this.updateEnemiesVelocity();


        this.game.physics.arcade.collide(this.player.bulletPool, this.enemies, function(b,e){
            e.kill();
            b.kill();
        }, null, this);
        
        this.enemies.forEachAlive(function(e) {
            this.player.wavePool.forEachAlive(function (w) {
              if (Phaser.Circle.intersectsRectangle(w._collideCircle, e.body)) {
                // console.log('woooohooo');
                // sprite.kill();
                e.body.velocity.x = this.E_VELO * Math.cos(this.game.physics.arcade.angleBetween(w,e));// * this.WORLD_SPEED;
                e.body.drag.x = this.E_DRAG;// * this.WORLD_SPEED;
                e.body.velocity.y = this.E_VELO * Math.sin(this.game.physics.arcade.angleBetween(w,e));// * this.WORLD_SPEED
                e.body.drag.y = this.E_DRAG;// * this.WORLD_SPEED;
                e._waveAffected = true;
                e._worldSpeed = this.WORLD_SPEED;
              }

            },this);
        },this);
    },

    shoot: function () {
        var bullet = this.player.bulletPool.getFirstDead();
        if (bullet === null || bullet === undefined) return;

        bullet.revive();
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;
        bullet.reset(this.player.x, this.player.y);
        bullet.rotation = this.player.rotation;
        bullet.body.velocity.x = Math.cos(bullet.rotation) * this.BULLET_SPEED;// * this.WORLD_SPEED;
        bullet.body.velocity.y = Math.sin(bullet.rotation) * this.BULLET_SPEED;// * this.WORLD_SPEED;
    },

    wave: function () {
        var w = game.add.sprite(this.player.x, this.player.y, 'wave');
        var WAVE_SPEED = 200;
        w.scale.x = 0;
        w.scale.y = 0;
        w.anchor.setTo(0.5,0.5);
        w._collideCircle = new Phaser.Circle(w.x, w.y, 0);
        this.player.wavePool.add(w);
        this.game.physics.enable(w, Phaser.Physics.ARCADE);
        this.game.add.tween(w).to({alpha:0.5},WAVE_SPEED, Phaser.Easing.Linear.None, true, 0, 0, false);
        this.game.add.tween(w.scale)
            .to({x: 1, y: 1}, WAVE_SPEED, Phaser.Easing.Linear.None, true, 0, 0, false)
            .onUpdateCallback( function( ) {
                this._collideCircle.diameter = w.width;
            }, w)
            .onComplete.add(function(){
                this.kill();
            },w);
    }
};

game.state.add('play', playState);
game.state.start('play');
