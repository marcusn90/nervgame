var game = new Phaser.Game(600, 600, Phaser.AUTO, 'body');

playState = {
    init: function() {
    },

    preload: function() {
        this.game.load.spritesheet('character', 'assets/character.png');
        this.game.load.image('bullet','assets/bullet.png');
    },

    create: function() {
        this.game.stage.backgroundColor = '#dfdfdf';
        this.player = game.add.sprite(20, 20, 'character');
        this.player.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
      
        this.game.input.activePointer.x = this.game.width/2;
        this.game.input.activePointer.y = this.game.height/2 - 100;
        this.playerSpeed = 250;
        this.BULLET_SPEED = 600;
        this.WORLD_SPEED = 1;
        this.player.bulletPool = this.game.add.group();
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
            Phaser.Keyboard.SHIFT
        ]);
        
        this.enemies = this.game.add.group();
        for ( var i = 0; i < 5; i++ ) {
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
            this.WORLD_SPEED = 0.03;
        } else {
            this.WORLD_SPEED = 1;
        }
        
        this.player.rotation = this.game.physics.arcade.angleToPointer(this.player);
        if ( this.game.input.activePointer.isDown ) {
            this.shoot();
            console.log(this.player.bulletPool.length);
        }
        this.updateBulletsVelocity();
        

        this.game.physics.arcade.collide(this.player.bulletPool, this.enemies, function(b,e){
            e.kill();
            b.kill();
        }, null, this);
        
        
    },
    
    updateBulletsVelocity: function () {
        this.player.bulletPool.forEachAlive(function(b){
            b.body.velocity.x = Math.cos(b.rotation) * this.BULLET_SPEED * this.WORLD_SPEED;
            b.body.velocity.y = Math.sin(b.rotation) * this.BULLET_SPEED * this.WORLD_SPEED;
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
        bullet.body.velocity.x = Math.cos(bullet.rotation) * this.BULLET_SPEED * this.WORLD_SPEED;
        bullet.body.velocity.y = Math.sin(bullet.rotation) * this.BULLET_SPEED * this.WORLD_SPEED;
    }
};

game.state.add('play', playState);
game.state.start('play');
