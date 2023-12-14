_G.love = require("love")


local function colorSquare(x, y)
    love.graphics.rectangle("fill", (x*square), (y*square), square, square)
end


local function drawArrow(x1, y1, x2, y2)
    local m = (y1-y2)/(x1-x2) -- gradient
    local c = y1-(m*x1) --y=mx+c




    local _m = -(1/m)
    local _c1 = y1-(_m*x1)
    local _c2 = y2-(_m*x2)
    local x3 = x1 + 0.1*square
    local y3 = _m * x3 + _c1
    local x4 = x1 - 0.1*square
    local y4 = _m * x4 + _c1
    --DIFFERENT Y INTERCEPT
    local x5 = x2 - 0.1*square
    local y5 = _m * x5 + _c2
    local x6 = x2 + 0.1*square
    local y6 = _m * x6 + _c2


    love.graphics.setColor(love.math.colorFromBytes(235,50,50,150))
    love.graphics.arc("fill", x1, y1, 0.14*square,math.atan(_m), math.atan(_m)+math.pi, 15)
    love.graphics.arc("fill", x2, y2, 0.14*square, math.atan(_m), math.atan(_m)-math.pi, 15)
    love.graphics.circle("fill", x2, y2, 0.2*square)
    love.graphics.circle("fill", x2, y2, 0.25*square)
    love.graphics.polygon("fill", x3,y3, x4,y4, x5,y5, x6,y6)
  end


local function drawBoard()
    for x = 1, 8 do
        for y = 1, 8 do
            local rgb = (x+y+1)%2==0 and {100, 50, 175} or {200, 150, 255}
            love.graphics.setColor(love.math.colorFromBytes(rgb[1], rgb[2], rgb[3]))
            love.graphics.rectangle("fill", (x*square), (y*square), square, square)
        end
    end
    love.graphics.rectangle("line", square, square, square*8, square*8)

    love.graphics.setColor(love.math.colorFromBytes(173, 163, 83, 200))
    if clickedSquare and (orientation == clickedSquare[3]) then colorSquare(clickedSquare[1], clickedSquare[2])
    elseif clickedSquare and (orientation ~= clickedSquare[3]) then colorSquare(9-clickedSquare[1], 9-clickedSquare[2]) end

    love.graphics.setColor(love.math.colorFromBytes(235, 64, 52, 200))
    for i = 1, #highlightSquares do
        if orientation == highlightSquares[i][3] then colorSquare(highlightSquares[i][1], highlightSquares[i][2])
        else colorSquare(9-highlightSquares[i][1], 9-highlightSquares[i][2]) end
    end
end

local function genAudioList()
    math.randomseed(os.time())
    AudioList = {}
    choices = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
    for i = 1, 10 do
        local index = math.random(#choices)
        local c = choices[index]
        table.insert(AudioList, c)
        table.remove(choices, index)
    end
    return AudioList
end


local function playAudio()
    local song = music[AudioList[CurrentlyPlaying]]
    if song:tell() >= song:getDuration() - 1 then
        love.audio.stop()
        CurrentlyPlaying = CurrentlyPlaying + 1
        if CurrentlyPlaying == 11 then
            AudioList = genAudioList()
            CurrentlyPlaying = 1
        end
    end
    music[AudioList[CurrentlyPlaying]]:play()
end

local function drawPosFromFEN(fen)
    love.graphics.setColor(love.math.colorFromBytes(255,255,255))
    local x, y = orientation and 1 or 8, orientation and 1 or 8
    for i = 1, #fen do
        local char = fen:sub(i,i)
        if char == "/" then
            x, y = orientation and 1 or 8, orientation and y+1 or y-1
        elseif not tonumber(char) then
            love.graphics.draw(pieces[char], x*square, y*square, 0, square/800, square/800)
            x = orientation and x+1 or x-1
        else
            x = orientation and x+tonumber(char) or x-tonumber(char)
        end
    end            
end


local function click()
end


local function getRankandFileFromMouse(x, y, isRelease, button)
    if math.min(x,y) > square and math.max(x,y) < square * 9 then
        rank, file = math.floor(x/square), math.floor(y/square)
        if orientation then file = 9-file else rank = 9-rank end
        rankLetter = string.char(rank+96)

        if button == 1 then
            highlightSquares, arrowSquares = {}, {}
            _startSquare, _endSquare = nil, nil


            if not(isRelease and not startSquare) then --skip if mb 1 is released and startSquare is empty
                if not isRelease and not endSquare and startSquare == rankLetter..file then -- reset if the same square is clicked twice
                    startSquare, endSquare, clickedSquare = nil, nil, nil 
                elseif not startSquare then --if startSquare is empty + has to be valid piece
                    clickedSquare = {math.floor(x/square),math.floor(y/square), orientation}
                    startSquare = rankLetter..file
                elseif not endSquare and startSquare ~= rankLetter..file then -- if endsquare is empty and it's not a repeat
                    endSquare = rankLetter..file
                end

                if startSquare and endSquare then 
                    print(startSquare..endSquare) --move made
                    startSquare, endSquare, clickedSquare = nil, nil, nil -- reset
                end
            end

            
        elseif button == 2 then
            startSquare, endSquare, clickedSquare = nil, nil, nil
            -------------------------------------------------------------
            
            table.insert(highlightSquares, {math.floor(x/square),math.floor(y/square), orientation})
        end
    end
end


local function validateMove()

end


---------------------------------------------------------------------------------------------------------------------


function love.mousepressed(x, y, button)
    getRankandFileFromMouse(x, y, false, button) 
end


function love.mousereleased(x, y, button)
    if button == 1 then 
        getRankandFileFromMouse(x, y, true, button) 
    end
end

function love.keypressed(key)
    if key == "x" then
        orientation = not orientation
    end
end


function love.load()
    --love.graphics.setDefaultFilter("nearest", "nearest")
    _G.startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
    _G.newFEN = "rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP3N/2N5/1P2PPPP/R1BQKB1R"
    _G.pieces = {
        ["k"] = love.graphics.newImage("Pieces/bKing.png"),
        ["q"] = love.graphics.newImage("Pieces/bQueen.png"),
        ["r"] = love.graphics.newImage("Pieces/bRook.png"),
        ["b"] = love.graphics.newImage("Pieces/bBishop.png"),
        ["n"] = love.graphics.newImage("Pieces/bKnight.png"),
        ["p"] = love.graphics.newImage("Pieces/bPawn.png"),
        ["K"] = love.graphics.newImage("Pieces/wKing.png"),
        ["Q"] = love.graphics.newImage("Pieces/wQueen.png"),
        ["R"] = love.graphics.newImage("Pieces/wRook.png"),
        ["B"] = love.graphics.newImage("Pieces/wBishop.png"),
        ["N"] = love.graphics.newImage("Pieces/wKnight.png"),
        ["P"] = love.graphics.newImage("Pieces/wPawn.png")
    }
    _G.music = {
        love.audio.newSource("Music/A summer where I saw a meteor shower.mp3", "stream"),
        love.audio.newSource("Music/Dark Sheep.mp3", "stream"),
        love.audio.newSource("Music/LALA.mp3", "stream"),
        love.audio.newSource("Music/level99.mp3", "stream"),
        love.audio.newSource("Music/Looking At The Stars Never Seen.mp3", "stream"),
        love.audio.newSource("Music/Mr.LittleHeart's Adventure.mp3", "stream"),
        love.audio.newSource("Music/Race to the Mountain.mp3", "stream"),
        love.audio.newSource("Music/Still Believe.mp3", "stream"),
        love.audio.newSource("Music/The first snowfall on my secret base.mp3", "stream"),
        love.audio.newSource("Music/To the Milky Way.mp3", "stream")
    }
    _G.AudioList = genAudioList()
    _G.CurrentlyPlaying = 1
    _G.orientation = true
    _G.startSquare = nil
    _G.endSquare = nil
    _G.clickedSquare = nil
    _G.highlightSquares = {}
    _G.arrows = {}

    for i, v in pairs(music) do
        music[i]:setVolume(0.1)
    end
end


function love.update(dt)

end


function love.draw()
    pix = math.min(love.graphics.getDimensions())
    square = pix/10

    playAudio()
    drawBoard()
    drawPosFromFEN(startFEN)
    drawArrow(7.5*square, 8.5*square, 6.5*square, 6.5*square)
end