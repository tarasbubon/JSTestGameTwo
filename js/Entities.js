var player;

Entity = function(type, id, x, y, width, height, img)
{
	var self = {
		type:type,
		id:id,
		x:x,
		y:y,
		width:width,
		height:height,
		img:img,
	};
	
	self.update = function()
	{
		self.updatePosition();
		self.draw();
	}
	
	self.draw= function()
	{
		ctx.save();
		
		var x = self.x - player.x;
		var y = self.y - player.y;
		
		x += WIDTH / 2;
		y += HEIGHT / 2;
		x -= self.width / 2;
		y -= self.height / 2;
		
		ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height, x, y, self.width, self.height);
		
		ctx.restore();
	}
	
	self.getDistanceBetween = function(entity2)
	{
		var vx = self.x - entity2.x;
		var vy = self.y - entity2.y;
		return Math.sqrt(vx * vx + vy * vy);
	}

	self.testCollision = function(entity2)
	{
		var rect1 = {
			x: self.x - self.width / 2,
			y: self.y - self.height / 2,
			width: self.width,
			height: self.height,
		}
		
		var rect2 = {
			x: entity2.x - entity2.width / 2,
			y: entity2.y - entity2.height / 2,
			width: entity2.width,
			height: entity2.height,
		}
		
		return testCollisionPosition(rect1, rect2);
	}
	
	self.updatePosition = function(){}
	
	return self;
}

Player = function()
{
	var self = Actor('player', 'myId', 50, 40, 50 * 1.5, 70 * 1.5, Img.player, 10, 1);
	
	self.maxMoveSpeed = 10;
	self.pressingMouseLeft = false;
	self.pressingMouseRight = false;
	
	self.onDeath = function()
	{
		var timeSurvived = Date.now() - timeWhenGameStarted;
		console.log('You lost! You survived for ' + timeSurvived + " ms.");
		startNewGame();
	}
	
	var super_update = self.update;
	self.update = function()
	{
		super_update();
		if(self.pressingRight || self.pressingLeft || self.pressingDown || self.pressingUp)
		{
			self.spriteAnimCounter += 0.2;
		}
		if(self.pressingMouseLeft)
		{
			self.performAttack();
		}
		if(self.pressingMouseRight)
		{
			self.performSpecialAttack();
		}
	}
	
	return self;
}

Actor= function(type, id, x, y, width, height, img, hp, attackSpeed)
{
	var self = Entity(type, id, x, y, width, height, img);
	self.hp = hp;
	self.hpMax = hp;
	self.attackSpeed = attackSpeed;
	self.attackCounter = 0;
	self.aimAngle = 0;
	self.spriteAnimCounter = 0;
	
	self.pressingDown = false;
	self.pressingUp = false;
	self.pressingLeft = false;
	self.pressingRight = false;
	self.maxMoveSpeed = 3;
	
	self.performAttack = function()
	{
		if(self.attackCounter > 25)
		{
			self.attackCounter = 0;
			Bullet.generateBullet(self);
		}
	}
	
	var super_update = self.update;
	self.update = function()
	{
		super_update();
		self.attackCounter += self.attackSpeed;
		if(self.hp <= 0)
		{
			self.onDeath();
		}
	}
	
	self.draw= function()
	{
		ctx.save();
		
		var x = self.x - player.x;
		var y = self.y - player.y;
		
		x += WIDTH / 2;
		y += HEIGHT / 2;
		x -= self.width / 2;
		y -= self.height / 2;
		
		var frameWidth = self.img.width / 3;
		var frameHeight = self.img.height / 4;
		
		var aimAngle = self.aimAngle;
		if(aimAngle < 0)
		{
			aimAngle += 360;
		}
		
		var directionMod = 3;
		if(aimAngle >= 45 && aimAngle < 135)
		{
			directionMod = 2;
		}
		else if(aimAngle >= 135 && aimAngle < 225)
		{
			directionMod = 1;
		}
		else if(aimAngle >= 225 && aimAngle < 316)
		{
			directionMod = 0;
		}
		
		var walkingMod = Math.floor(self.spriteAnimCounter) % 3;
		
		ctx.drawImage(self.img, walkingMod * frameWidth, directionMod * frameHeight, frameWidth, frameHeight, x, y, self.width, self.height);
		
		ctx.restore();
	}
	
	self.updatePosition = function()
	{	
		var leftBump = {x:self.x - 40, y:self.y};
		var rightBumper = {x:self.x + 40, y:self.y};
		var upBumper = {x:self.x, y:self.y -16};
		var downBumper = {x:self.x, y:self.y + 64};
		
		if(Maps.current.isPositionWall(rightBumper))
		{
			self.x -= 5;
		}
		else
		{
			if(self.pressingRight)
			{
				self.x += self.maxMoveSpeed;
			}
		}
		
		if(Maps.current.isPositionWall(leftBump))
		{
			self.x += 5;
		}
		else
		{
			if(self.pressingLeft)
			{
				self.x -= self.maxMoveSpeed;
			}
		}
		
		if(Maps.current.isPositionWall(downBumper))
		{
			self.y -= 5;
		}
		else
		{
			if(self.pressingDown)
			{
				self.y += self.maxMoveSpeed;
			}
		}
		if(Maps.current.isPositionWall(upBumper))
		{
			self.y += 5;
		}
		else
		{
			if(self.pressingUp)
			{
				self.y -= self.maxMoveSpeed;
			}
		}
			
		if(self.x < self.width / 2)
		{
			self.x = self.width / 2;
		}
		if(self.x > Maps.current.width - self.width / 2)
		{
			self.x = Maps.current.width - self.width / 2;
		}
		if(self.y < self.height / 2)
		{
			self.y = self.height / 2;
		}
		if(self.y > Maps.current.height - self.height / 2)
		{
			self.y = Maps.current.height - self.height / 2;
		}
	}
	
	self.onDeath = function(){}
	
	self.performSpecialAttack = function()
	{
		if(self.attackCounter > 50)
		{
			self.attackCounter = 0;
			/*
			for(var i = 0; i < 360; i++)
			{
				Bullet.generateBullet(self, i);
			}
			*/
			Bullet.generateBullet(self, self.aimAngle - 5);
			Bullet.generateBullet(self, self.aimAngle);
			Bullet.generateBullet(self, self.aimAngle + 5);
		}
	}
	
	return self;
}

Enemy = function(id, x, y, width, height, img, hp, attackSpeed)
{
	var self = Actor('enemy', id, x, y, width, height, img, hp, attackSpeed);
	
	self.toRemove = false;
	
	self.updateAim = function()
	{
		var differenceX = player.x - self.x;
		var differenceY = player.y - self.y;
		
		self.aimAngle = Math.atan2(differenceY, differenceX) / Math.PI * 180;
	}
	
	self.updateKeyPress = function()
	{
		var differenceX = player.x - self.x;
		var differenceY = player.y - self.y;
		
		self.pressingRight = differenceX > 3;
		self.pressingLeft = differenceX < -3;
		self.pressingDown = differenceY > 3;
		self.pressingUp = differenceY < -3;
	}
	
	self.onDeath = function()
	{
		self.toRemove = true;
	}
	
	var super_update = self.update;
	self.update = function()
	{
		super_update();
		self.spriteAnimCounter += 0.2;
		self.updateAim();
		self.updateKeyPress();
		self.performAttack();
	}
	
	var super_draw = self.draw;
	self.draw = function()
	{
		super_draw();
		var x = self.x - player.x +  WIDTH / 2;
		var y = self.y - player.y +  HEIGHT / 2 - self.height / 2 - 20;
		
		ctx.save();
		ctx.fillStyle = 'red';
		var width = 100 * self.hp / self.hpMax;
		if(width < 0)
		{
			width = 0;
		}
		ctx.fillRect(x - 50, y, width, 10);
		
		ctx.strokeStyle = 'black';
		ctx.strokeRect(x - 50, y, 100, 10);
		
		ctx.restore();
	}
	
	Enemy.list[id] = self;
}

Enemy.list = {};

Enemy.update = function()
{
	if(frameCount % 100 === 0)
	{
		Enemy.randomlyGenerateEnemy();
	}	
	
	for(var enemy in Enemy.list)
	{
		Enemy.list[enemy].update();
	}
	
	for(var enemy in Enemy.list)
	{
		if(Enemy.list[enemy].toRemove)
		{
			delete Enemy.list[enemy];
		}
	}
}

Enemy.randomlyGenerateEnemy = function()
{
	var x = Math.random() * Maps.current.width;
	var y = Math.random() * Maps.current.height;
	var width = 64 * 1.5;
	var height = 64 * 1.5;
	var id = Math.random();
	
	if(Math.random() < 0.5)
	{
		Enemy(id, x, y, width, height, Img.bat, 2, 1);
	}
	else
	{
		Enemy(id, x, y, width, height, Img.bee, 1, 3);
	}
}

Upgrade = function(id, x, y, width, height, category, img)
{
	var self = Entity('upgrade', id, x, y, width, height, img);
	self.category = category;	
	
	var super_update = self.update;
	self.update = function()
	{
		super_update();
		var isColliding = player.testCollision(self);
		if(isColliding)
		{
			if(self.category === 'score')
			{
				score += 100;
			}
			if(self.category === 'attackSpeed')
			{
				player.attackSpeed += 3;
			}
			delete Upgrade.list[self.id];
		}
	}
	
	Upgrade.list[id] = self;
}

Upgrade.list = {};

Upgrade.update = function()
{
	if(frameCount % 75 === 0)
	{
		Upgrade.randomlyGenerateUpgrade();
	}	
	
	for(var upgrade in Upgrade.list)
	{
		Upgrade.list[upgrade].update();
	}
}

Upgrade.randomlyGenerateUpgrade = function()
{
	var x = Math.random() * Maps.current.width;
	var y = Math.random() * Maps.current.height;
	var width = 32;
	var height = 32;
	var id = Math.random();
	
	if(Math.random() < 0.5)
	{
		var category = 'score';
		var img = Img.upgrade1;
	}
	else
	{
		var category = 'attackSpeed';
		var img = Img.upgrade2;
	}
	
	Upgrade(id, x, y, width, height, category, img);
}

Bullet = function(id, x, y, spdX, spdY, width, height, combatType)
{
	var self = Entity('bullet', id, x, y, width, height, Img.bullet);
	
	self.timer = 0;
	self.combatType = combatType;
	self.spdX = spdX;
	self.spdY = spdY;
	self.toRemovee = false;
	
	self.updatePosition = function()
	{
		self.x += self.spdX;
		self.y += self.spdY;
			
		if(self.x < 0 || self.x > Maps.current.width)
		{
			self.spdX = -self.spdX;
		}
		if(self.y < 0 || self.y > Maps.current.height)
		{
			self.spdY = -self.spdY;
		}
	}
	
	var super_update = self.update;
	self.update = function()
	{
		super_update();
		self.timer++;
		if(self.timer > 75)
		{
			self.toRemove = true;
		}
		
		if(self.combatType === 'player')
		{
			for(var enemy in Enemy.list)
			{
				if(self.testCollision(Enemy.list[enemy]))
				{
					self.toRemove = true;
					Enemy.list[enemy].hp -= 1;
				}
			}
		}
		else if(self.combatType === 'enemy')
		{
			if(self.testCollision(player))
			{
				self.toRemove = true;
				player.hp -= 1;
			}
		}
		
		if(Maps.current.isPositionWall(self))
		{
			self.toRemove = true;
		}
	}
	
	Bullet.list[id] = self;
}

Bullet.list = {};

Bullet.update = function()
{
	for(var bullet in Bullet.list)
	{
		var b = Bullet.list[bullet];
		b.update();
		
		if(b.toRemove)
		{
			delete Bullet.list[bullet];
		}
	}
}

Bullet.generateBullet = function(actor, overwriteAngle)
{
	var x = actor.x;
	var y = actor.y;
	var width = 32;
	var height = 32;
	var id = Math.random();
	
	var angle = actor.aimAngle;
	if(overwriteAngle !== undefined)
	{
		angle = overwriteAngle;
	}
	var spdX = Math.cos(angle / 180 * Math.PI) * 5;
	var spdY = Math.sin(angle / 180 * Math.PI) * 5;
	Bullet(id, x, y, spdX, spdY, width, height, actor.type);
}