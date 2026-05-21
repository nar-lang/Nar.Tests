--- Nar.Tests native implementations (Lua).
--- Provides test display and runner functionality.
local rt = require("lunar.runtime")

local function display(result)
    local function showFailed(indent, msg)
        io.write(indent .. "❗️ " .. rt:toString(msg) .. "\n")
    end

    local function show(offset, passed, result)
        local indent = string.rep("  ", offset)
        local name = result.name

        if name == "Nar.Tests.Runner.TestResult#TestPassed" then
            io.write(indent .. "✅\n")
            return passed
        elseif name == "Nar.Tests.Runner.TestResult#TestFailed" then
            local failures = rt:toList(result.values[1])
            for _, f in ipairs(failures) do
                local fTuple = rt:toTuple(f)
                showFailed(indent, fTuple[1])
            end
            return false
        elseif name == "Nar.Tests.Runner.TestResult#LabeledResult" then
            local label = result.values[1]
            local testResult = result.values[2]
            local testName = testResult.name

            if testName == "Nar.Tests.Runner.TestResult#TestPassed" then
                io.write(indent .. "✅ " .. rt:toString(label) .. "\n")
                return passed
            elseif testName == "Nar.Tests.Runner.TestResult#TestFailed" then
                io.write(indent .. "⛔️ " .. rt:toString(label) .. "\n")
                show(offset + 1, passed, testResult)
                return false
            else
                io.write(indent .. "⚪️ " .. rt:toString(label) .. "\n")
                return show(offset + 1, passed, testResult)
            end
        elseif name == "Nar.Tests.Runner.TestResult#BatchResult" then
            local results = rt:toList(result.values[1])
            local ok = passed
            for _, r in ipairs(results) do
                ok = show(offset + 1, ok, r)
            end
            return ok
        elseif name == "Nar.Tests.Runner.TestResult#TestSkipped" then
            io.write(indent .. "✖️ Skipped\n")
            return passed
        end
        return passed
    end

    if show(0, true, result) then
        io.write("PASSED\n")
    else
        io.write("FAILED\n")
    end

    return result
end

rt:registerDef("Nar.Tests.Runner", "display", display, 1)
