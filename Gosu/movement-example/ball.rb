class Ball
	def initialize(img, x, y, angle)
		@img = img
		@x = x
		@y = y
		@angle = angle

		@velocityX = 25 + rand(150)
		@velocityY = 25 + rand(150)
		@velocityA = 45 + rand(15) # Angular Velocity
	end

	def draw
		@img.draw_rot( @x, @y, 0, @angle )
	end

	# Assumes 'delta' is measured in seconds
	def update(window, delta)
		# Movement logic
		@angle += @velocityA * delta
		@x += @velocityX * delta
		@y += @velocityY * delta

		# Collision Logic
		if @y - @img.height/2 < 0 or @y + @img.height/2 > window.height then
			@velocityY *= -1
		end
		if @x - @img.width/2 < 0 or @x + @img.width/2 > window.width then
			@velocityX *= -1
		end
	end
end
