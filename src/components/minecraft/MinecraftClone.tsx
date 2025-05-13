import { useEffect, useRef } from 'react'

// Constants for the game
const BLOCK_SIZE = 1.0
const GRAVITY = 0.05
const JUMP_FORCE = 0.3
const MOVE_SPEED = 0.1
const WORLD_SIZE = 32 // Size of the world in blocks
const WORLD_HEIGHT = 16 // Height of the world in blocks
const TERRAIN_HEIGHT = 8 // Base terrain height

// Block types
const AIR = 0
const GRASS = 1
const DIRT = 2
const STONE = 3

export function MinecraftClone() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStateRef = useRef({
    player: {
      x: WORLD_SIZE / 2,
      y: TERRAIN_HEIGHT + 2,
      z: WORLD_SIZE / 2,
      vx: 0,
      vy: 0,
      vz: 0,
      yaw: 0,
      pitch: 0
    },
    camera: {
      x: 0,
      y: 0,
      z: 0,
      yaw: 0,
      pitch: 0
    },
    keys: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    },
    mouse: {
      locked: false,
      x: 0,
      y: 0
    },
    blocks: [] as number[][][],
    selectedBlock: GRASS,
    lastTime: 0
  })

  // Initialize the world with terrain
  useEffect(() => {
    const { current: gameState } = gameStateRef

    // Initialize 3D array for blocks
    gameState.blocks = Array(WORLD_SIZE)
      .fill(null)
      .map(() =>
        Array(WORLD_HEIGHT)
          .fill(null)
          .map(() => Array(WORLD_SIZE).fill(AIR))
      )

    // Generate simple terrain
    for (let x = 0; x < WORLD_SIZE; x++) {
      for (let z = 0; z < WORLD_SIZE; z++) {
        // Simple flat terrain with some variation
        const height = Math.floor(
          TERRAIN_HEIGHT +
            Math.sin(x / 4) +
            Math.cos(z / 4) +
            Math.random() * 0.5
        )

        for (let y = 0; y < height; y++) {
          if (y === height - 1) {
            gameState.blocks[x][y][z] = GRASS
          } else if (y > height - 4) {
            gameState.blocks[x][y][z] = DIRT
          } else {
            gameState.blocks[x][y][z] = STONE
          }
        }
      }
    }

    // Set player position on top of terrain
    const x = Math.floor(WORLD_SIZE / 2)
    const z = Math.floor(WORLD_SIZE / 2)
    let y = 0
    for (let i = WORLD_HEIGHT - 1; i >= 0; i--) {
      if (gameState.blocks[x][i][z] !== AIR) {
        y = i + 1
        break
      }
    }
    gameState.player.y = y + 1
  }, [])

  // Set up the game loop and event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    // Initialize WebGL
    initWebGL(gl)

    // Set up event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      const { current: gameState } = gameStateRef
      switch (e.code) {
        case 'KeyW':
          gameState.keys.forward = true
          break
        case 'KeyS':
          gameState.keys.backward = true
          break
        case 'KeyA':
          gameState.keys.left = true
          break
        case 'KeyD':
          gameState.keys.right = true
          break
        case 'Space':
          gameState.keys.jump = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const { current: gameState } = gameStateRef
      switch (e.code) {
        case 'KeyW':
          gameState.keys.forward = false
          break
        case 'KeyS':
          gameState.keys.backward = false
          break
        case 'KeyA':
          gameState.keys.left = false
          break
        case 'KeyD':
          gameState.keys.right = false
          break
        case 'Space':
          gameState.keys.jump = false
          break
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { current: gameState } = gameStateRef
      if (gameState.mouse.locked) {
        gameState.player.yaw += e.movementX * 0.003
        gameState.player.pitch -= e.movementY * 0.003

        // Clamp pitch to prevent flipping
        gameState.player.pitch = Math.max(
          -Math.PI / 2 + 0.1,
          Math.min(Math.PI / 2 - 0.1, gameState.player.pitch)
        )
      }
    }

    const handleClick = () => {
      const { current: gameState } = gameStateRef
      if (!gameState.mouse.locked) {
        canvas.requestPointerLock()
      }
    }

    const handlePointerLockChange = () => {
      const { current: gameState } = gameStateRef
      gameState.mouse.locked = document.pointerLockElement === canvas
    }

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)
    document.addEventListener('pointerlockchange', handlePointerLockChange)

    // Start the game loop
    const gameLoop = (time: number) => {
      const { current: gameState } = gameStateRef
      const deltaTime = time - gameState.lastTime
      gameState.lastTime = time

      update(deltaTime / 1000)
      render(gl)

      requestAnimationFrame(gameLoop)
    }

    gameStateRef.current.lastTime = performance.now()
    requestAnimationFrame(gameLoop)

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
    }
  }, [])

  // Update the game state
  const update = (deltaTime: number) => {
    const { current: gameState } = gameStateRef
    const { player, keys } = gameState

    // Movement direction based on camera
    const moveX =
      (keys.right ? 1 : 0) -
      (keys.left ? 1 : 0) * Math.cos(player.yaw) +
      (keys.forward ? 1 : 0) -
      (keys.backward ? 1 : 0) * Math.sin(player.yaw)
    const moveZ =
      (keys.right ? 1 : 0) -
      (keys.left ? 1 : 0) * Math.sin(player.yaw) -
      (keys.forward ? 1 : 0) +
      (keys.backward ? 1 : 0) * Math.cos(player.yaw)

    // Apply movement
    player.vx = moveX * MOVE_SPEED
    player.vz = moveZ * MOVE_SPEED

    // Apply gravity
    player.vy -= GRAVITY * deltaTime

    // Handle jumping
    if (keys.jump && isOnGround(player)) {
      player.vy = JUMP_FORCE
    }

    // Update position with collision detection
    const newX = player.x + player.vx
    const newY = player.y + player.vy
    const newZ = player.z + player.vz

    // Simple collision detection
    if (!isBlockSolid(Math.floor(newX), Math.floor(player.y), Math.floor(player.z)) &&
        !isBlockSolid(Math.floor(newX), Math.floor(player.y + 1), Math.floor(player.z))) {
      player.x = newX
    }

    if (!isBlockSolid(Math.floor(player.x), Math.floor(newY), Math.floor(player.z)) &&
        !isBlockSolid(Math.floor(player.x), Math.floor(newY + 1), Math.floor(player.z))) {
      player.y = newY
    } else if (player.vy < 0) {
      // Hit the ground
      player.vy = 0
    }

    if (!isBlockSolid(Math.floor(player.x), Math.floor(player.y), Math.floor(newZ)) &&
        !isBlockSolid(Math.floor(player.x), Math.floor(player.y + 1), Math.floor(newZ))) {
      player.z = newZ
    }

    // Update camera position to follow player
    gameState.camera.x = player.x
    gameState.camera.y = player.y + 1.7 // Eye height
    gameState.camera.z = player.z
    gameState.camera.yaw = player.yaw
    gameState.camera.pitch = player.pitch
  }

  // Check if a block is solid
  const isBlockSolid = (x: number, y: number, z: number) => {
    const { current: gameState } = gameStateRef
    if (x < 0 || x >= WORLD_SIZE || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= WORLD_SIZE) {
      return true // World boundaries are solid
    }
    return gameState.blocks[x][y][z] !== AIR
  }

  // Check if the player is on the ground
  const isOnGround = (player: typeof gameStateRef.current.player) => {
    return isBlockSolid(
      Math.floor(player.x),
      Math.floor(player.y - 0.1),
      Math.floor(player.z)
    )
  }

  // WebGL initialization and rendering
  const initWebGL = (gl: WebGLRenderingContext) => {
    // Vertex shader
    const vertexShaderSource = `
      attribute vec4 aVertexPosition;
      attribute vec4 aVertexColor;
      
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      
      varying lowp vec4 vColor;
      
      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
      }
    `

    // Fragment shader
    const fragmentShaderSource = `
      varying lowp vec4 vColor;
      
      void main(void) {
        gl_FragColor = vColor;
      }
    `

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    // Create program
    const shaderProgram = gl.createProgram()!
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)

    // Store program info
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor')
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
      }
    }

    // Create buffers
    const buffers = {
      position: gl.createBuffer(),
      color: gl.createBuffer(),
      indices: gl.createBuffer()
    }

    // Store as properties on gl object for access in render function
    ;(gl as any).programInfo = programInfo
    ;(gl as any).buffers = buffers

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
  }

  const render = (gl: WebGLRenderingContext) => {
    const glExt = gl as any
    if (!glExt.programInfo || !glExt.buffers) return

    // Clear the canvas
    gl.clearColor(0.53, 0.81, 0.92, 1.0) // Sky blue
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const { current: gameState } = gameStateRef
    const { camera } = gameState

    // Create projection matrix
    const fieldOfView = 60 * Math.PI / 180 // 60 degrees in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.1
    const zFar = 100.0
    const projectionMatrix = mat4Perspective(fieldOfView, aspect, zNear, zFar)

    // Create camera matrix
    const modelViewMatrix = mat4Identity()
    mat4Rotate(modelViewMatrix, camera.pitch, [1, 0, 0]) // Pitch (x-axis)
    mat4Rotate(modelViewMatrix, camera.yaw, [0, 1, 0])   // Yaw (y-axis)
    mat4Translate(modelViewMatrix, [-camera.x, -camera.y, -camera.z])

    // Render blocks
    renderBlocks(gl, projectionMatrix, modelViewMatrix)
  }

  const renderBlocks = (
    gl: WebGLRenderingContext,
    projectionMatrix: number[],
    viewMatrix: number[]
  ) => {
    const glExt = gl as any
    if (!glExt.programInfo || !glExt.buffers) return

    const { current: gameState } = gameStateRef
    const { blocks } = gameState

    // For each block type, collect all instances to render in batch
    const blockPositions: number[] = []
    const blockColors: number[] = []
    const blockIndices: number[] = []

    let indexOffset = 0

    // Collect visible blocks
    for (let x = 0; x < WORLD_SIZE; x++) {
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
          const blockType = blocks[x][y][z]
          if (blockType === AIR) continue

          // Only render blocks that have at least one exposed face
          if (isBlockSurrounded(x, y, z)) continue

          // Add a cube for this block
          addCubeToBuffers(
            blockPositions,
            blockColors,
            blockIndices,
            x, y, z,
            getBlockColor(blockType),
            indexOffset
          )
          indexOffset += 24 // 24 vertices per cube (4 vertices per face * 6 faces)
        }
      }
    }

    // Update position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, glExt.buffers.position)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blockPositions), gl.STATIC_DRAW)

    // Update color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, glExt.buffers.color)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blockColors), gl.STATIC_DRAW)

    // Update index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glExt.buffers.indices)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(blockIndices), gl.STATIC_DRAW)

    // Set up attribute pointers
    gl.bindBuffer(gl.ARRAY_BUFFER, glExt.buffers.position)
    gl.vertexAttribPointer(
      glExt.programInfo.attribLocations.vertexPosition,
      3, // 3 components per vertex (x, y, z)
      gl.FLOAT,
      false,
      0,
      0
    )
    gl.enableVertexAttribArray(glExt.programInfo.attribLocations.vertexPosition)

    gl.bindBuffer(gl.ARRAY_BUFFER, glExt.buffers.color)
    gl.vertexAttribPointer(
      glExt.programInfo.attribLocations.vertexColor,
      4, // 4 components per color (r, g, b, a)
      gl.FLOAT,
      false,
      0,
      0
    )
    gl.enableVertexAttribArray(glExt.programInfo.attribLocations.vertexColor)

    // Set uniforms
    gl.uniformMatrix4fv(
      glExt.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    )
    gl.uniformMatrix4fv(
      glExt.programInfo.uniformLocations.modelViewMatrix,
      false,
      viewMatrix
    )

    // Draw the elements
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glExt.buffers.indices)
    gl.drawElements(
      gl.TRIANGLES,
      blockIndices.length,
      gl.UNSIGNED_SHORT,
      0
    )
  }

  // Check if a block is completely surrounded by other blocks
  const isBlockSurrounded = (x: number, y: number, z: number) => {
    const { current: gameState } = gameStateRef
    const { blocks } = gameState

    // Check all 6 adjacent blocks
    const directions = [
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1]
    ]

    for (const [dx, dy, dz] of directions) {
      const nx = x + dx
      const ny = y + dy
      const nz = z + dz

      // If any adjacent block is air or out of bounds, this block is visible
      if (nx < 0 || nx >= WORLD_SIZE || 
          ny < 0 || ny >= WORLD_HEIGHT || 
          nz < 0 || nz >= WORLD_SIZE ||
          blocks[nx][ny][nz] === AIR) {
        return false
      }
    }

    return true
  }

  // Add a cube to the rendering buffers
  const addCubeToBuffers = (
    positions: number[],
    colors: number[],
    indices: number[],
    x: number,
    y: number,
    z: number,
    color: number[],
    indexOffset: number
  ) => {
    const size = BLOCK_SIZE / 2

    // Define the 8 vertices of the cube
    const vertices = [
      // Front face
      x - size, y - size, z + size,
      x + size, y - size, z + size,
      x + size, y + size, z + size,
      x - size, y + size, z + size,
      
      // Back face
      x - size, y - size, z - size,
      x - size, y + size, z - size,
      x + size, y + size, z - size,
      x + size, y - size, z - size,
      
      // Top face
      x - size, y + size, z - size,
      x - size, y + size, z + size,
      x + size, y + size, z + size,
      x + size, y + size, z - size,
      
      // Bottom face
      x - size, y - size, z - size,
      x + size, y - size, z - size,
      x + size, y - size, z + size,
      x - size, y - size, z + size,
      
      // Right face
      x + size, y - size, z - size,
      x + size, y + size, z - size,
      x + size, y + size, z + size,
      x + size, y - size, z + size,
      
      // Left face
      x - size, y - size, z - size,
      x - size, y - size, z + size,
      x - size, y + size, z + size,
      x - size, y + size, z - size,
    ]

    // Add vertices to positions array
    positions.push(...vertices)

    // Add colors for each vertex
    for (let i = 0; i < 24; i++) {
      colors.push(...color)
    }

    // Add indices for each face (6 faces, 2 triangles per face)
    for (let i = 0; i < 6; i++) {
      const faceOffset = indexOffset + i * 4
      indices.push(
        faceOffset, faceOffset + 1, faceOffset + 2,
        faceOffset, faceOffset + 2, faceOffset + 3
      )
    }
  }

  // Get color based on block type
  const getBlockColor = (blockType: number) => {
    switch (blockType) {
      case GRASS:
        return [0.0, 0.8, 0.0, 1.0] // Green
      case DIRT:
        return [0.6, 0.3, 0.0, 1.0] // Brown
      case STONE:
        return [0.5, 0.5, 0.5, 1.0] // Gray
      default:
        return [1.0, 1.0, 1.0, 1.0] // White
    }
  }

  // Matrix utility functions
  const mat4Identity = () => {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]
  }

  const mat4Perspective = (fovy: number, aspect: number, near: number, far: number) => {
    const f = 1.0 / Math.tan(fovy / 2)
    const nf = 1 / (near - far)

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]
  }

  const mat4Translate = (mat: number[], vec: number[]) => {
    const [x, y, z] = vec
    mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12]
    mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13]
    mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14]
    mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15]
  }

  const mat4Rotate = (mat: number[], angle: number, axis: number[]) => {
    let [x, y, z] = axis
    const len = Math.sqrt(x * x + y * y + z * z)
    
    if (len < 0.000001) return

    x /= len
    y /= len
    z /= len

    const s = Math.sin(angle)
    const c = Math.cos(angle)
    const t = 1 - c

    // Calculate rotation matrix elements
    const a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3]
    const a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7]
    const a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11]

    // Construct rotation matrix
    const b00 = x * x * t + c
    const b01 = y * x * t + z * s
    const b02 = z * x * t - y * s
    const b10 = x * y * t - z * s
    const b11 = y * y * t + c
    const b12 = z * y * t + x * s
    const b20 = x * z * t + y * s
    const b21 = y * z * t - x * s
    const b22 = z * z * t + c

    // Multiply matrices
    mat[0] = a00 * b00 + a10 * b01 + a20 * b02
    mat[1] = a01 * b00 + a11 * b01 + a21 * b02
    mat[2] = a02 * b00 + a12 * b01 + a22 * b02
    mat[3] = a03 * b00 + a13 * b01 + a23 * b02
    
    mat[4] = a00 * b10 + a10 * b11 + a20 * b12
    mat[5] = a01 * b10 + a11 * b11 + a21 * b12
    mat[6] = a02 * b10 + a12 * b11 + a22 * b12
    mat[7] = a03 * b10 + a13 * b11 + a23 * b12
    
    mat[8] = a00 * b20 + a10 * b21 + a20 * b22
    mat[9] = a01 * b20 + a11 * b21 + a21 * b22
    mat[10] = a02 * b20 + a12 * b21 + a22 * b22
    mat[11] = a03 * b20 + a13 * b21 + a23 * b22
  }

  return (
    <div className="minecraft-clone-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full border border-gray-300 rounded-md"
        tabIndex={0}
      />
      <div className="mt-4 text-center text-sm text-gray-600">
        Click to play. WASD to move, Space to jump, Mouse to look around.
      </div>
    </div>
  )
}