export default function (runtime) {
    function display(result) {
        const node = (text, tag, cls) => {
            const elem = document.createElement(tag || "DIV");
            elem.innerText = text;
            if (cls) {
                elem.className = cls;
            }
            document.body.append(elem);
            return elem;
        }
        const isOk = (passed, result) => {
            if (!passed) {
                return false
            }
            switch (result.name) {
                case "Oak.Tests.Runner.TestResult#TestPassed":
                    return true
                case "Oak.Tests.Runner.TestResult#TestFailed":
                    return false
                case "Oak.Tests.Runner.TestResult#LabeledResult":
                    return isOk(passed, result.values[1])
                case "Oak.Tests.Runner.TestResult#BatchResult":
                    return runtime.unwrapShallow(result.values[0]).reduce(isOk, passed);
                case "Oak.Tests.Runner.TestResult#TestSkipped":
                    return true
            }
        }
        const showFailed = (indent, msg, reason) => {
            const strReason = runtime.execute("Oak.Tests.Reason.toString", reason);
            node(indent + "❗️" + msg.value + " " + strReason.value, "div", "failed");
        }
        const show = (offset, passed, result) => {
            const indent = "  ".repeat(offset);

            switch (result.name) {
                case "Oak.Tests.Runner.TestResult#TestPassed":
                    node(indent + "✅", "div", "passed");
                    return passed;
                case "Oak.Tests.Runner.TestResult#TestFailed":
                    runtime.unwrapShallow(result.values[0]).forEach(x => {
                        showFailed(indent, x.value[0], x.value[1]);
                    });
                    return false;
                case "Oak.Tests.Runner.TestResult#LabeledResult":
                    switch (result.values[1].name) {
                        case "Oak.Tests.Runner.TestResult#TestPassed":
                            node(indent + "✅ " + result.values[0].value, "div", "passed");
                            return passed;
                        case "Oak.Tests.Runner.TestResult#TestFailed":
                            node(indent + "⛔️ " + result.values[0].value, "div", "failed");
                            show(offset + 1, passed, result.values[1])
                            return false;
                        default:
                            node(indent + "⚪️ " + result.values[0].value, "div");
                            return show(offset + 1, passed, result.values[1]);
                    }
                case "Oak.Tests.Runner.TestResult#BatchResult":
                    return runtime.unwrapShallow(result.values[0]).reduce(show.bind(this, offset + 1), passed);
                case "Oak.Tests.Runner.TestResult#TestSkipped":
                    node(indent + "✖️ Skipped", "div", "skipped");
                    return passed;
            }
        }

        if (show(0, true, result)) {
            document.body.className = "passed";
        } else {
            document.body.className = "failed";
        }
        node("body{font-family: monospace; font-size: 12px; white-space: pre;} " +
            "h1 {font-size: 16px; }" +
            ".passed{color: green;} " +
            ".failed{color: red;} " +
            ".skipped{color: grey;} " +
            "body.passed {color: black; background-color: #eefff3;} " +
            "body.failed {color: black; background-color: #ffd3ce;} ",
            "style");

        return result
    }

    runtime.register("Oak.Tests.Runner", {
        display
    });
}
