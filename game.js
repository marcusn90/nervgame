var game = new Phaser.Game(600, 600, Phaser.AUTO, 'body');
playState = {
    init: function() {
    //Called as soon as we enter this state
        console.log('state init');
    },

    preload: function() {
        console.log('state preload');
        this.game.load.spritesheet('character', 'assets/character.png');
        this.game.load.image('bullet','assets/bullet.png');
    //Assets to be loaded before create() is called
    },

    create: function() {
        console.log('state create');
        this.game.stage.backgroundColor = '#dfdfdf';
        this.player = game.add.sprite(20, 20, 'character');
        this.player.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
      
        this.game.input.activePointer.x = this.game.width/2;
        this.game.input.activePointer.y = this.game.height/2 - 100;
        this.playerSpeed = 300;
        this.BULLET_SPEED = 700;
        this.player.bulletPool = this.game.add.group();
        for(var i = 0; i < 100; i++) {
            // Create each bullet and add it to the group.
            var bullet = this.game.add.sprite(0, 0, 'bullet');
            this.player.bulletPool.add(bullet);

            // Set its pivot point to the center of the bullet
            bullet.anchor.setTo(0.5, 0.5);

            // Enable physics on the bullet
            this.game.physics.enable(bullet, Phaser.Physics.ARCADE);

            // Set its initial state to "dead".
            bullet.kill();
        }
        this.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.A,
            Phaser.Keyboard.D,
            Phaser.Keyboard.W,
            Phaser.Keyboard.S
        ]);
        
        this.enemies = this.game.add.group();
        for ( var i = 0; i < 2; i++ ) {
            var enemy = game.add.sprite(20, 20, 'character');
            enemy.anchor.setTo(0.5, 0.5);
            enemy.reset(40 + i*70, 40 + i*100);
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
        
        this.player.rotation = this.game.physics.arcade.angleToPointer(this.player);
        if ( this.game.input.activePointer.isDown ) {
            this.shoot();
            console.log(this.player.bulletPool.length);
        }
        

        this.game.physics.arcade.collide(this.player.bulletPool, this.enemies, function(b,e){
            console.log('ENEMY KILLED');
            e.kill();
            b.kill();
        }, null, this);
        
        
    },
    
    shoot: function () {
        var bullet = this.player.bulletPool.getFirstDead();
//        var bullet = this.player.bulletPool.getFirstAlive();

        // If there aren't any bullets available then don't shoot
        if (bullet === null || bullet === undefined) return;
       
        // Revive the bullet
        // This makes the bullet "alive"
        bullet.revive();

        // Bullets should kill themselves when they leave the world.
        // Phaser takes care of this for me by setting this flag
        // but you can do it yourself by killing the bullet if
        // its x,y coordinates are outside of the world.
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;

        // Set the bullet position to the gun position.
        bullet.reset(this.player.x, this.player.y);
        bullet.rotation = this.player.rotation;

        // Shoot it in the right direction
        bullet.body.velocity.x = Math.cos(bullet.rotation) * this.BULLET_SPEED;
        bullet.body.velocity.y = Math.sin(bullet.rotation) * this.BULLET_SPEED;
    }
};

game.state.add('play', playState);
game.state.start('play');

console.log('Current state: ' + game.state.getCurrentState());