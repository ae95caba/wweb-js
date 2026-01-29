const { shouldIgnoreMessage, handleBotMessage, userStates } = require('./ai,js');

// Mock Message
function createMockMessage(userId, content = "Hola") {
    return {
        from: userId,
        body: content,
        type: 'chat',
        _data: {
            id: { fromMe: false }
        },
        getChat: async () => ({
            isGroup: false,
            muteExpiration: 0
        })
    };
}

// Helper to mock Date
function mockDate(year, month, day, hour, minute) {
    const FixedDate = new Date(year, month, day, hour, minute);

    // Guardar la clase Date original
    const OriginalDate = Date;

    // Sobrescribir
    global.Date = class extends OriginalDate {
        constructor(...args) {
            if (args.length) return new OriginalDate(...args);
            return FixedDate;
        }

        static now() {
            return FixedDate.getTime();
        }
    };

    return () => { global.Date = OriginalDate; }; // Restore function
}

async function runTests() {
    console.log("🚀 Starting Verification Tests...");

    // Reset states
    for (const key in userStates) delete userStates[key];

    // Test 1: Outside Business Hours (Monday 10:00 AM)
    console.log("\n🧪 Test 1: Outside Business Hours (Monday 10:00 AM)");
    let restoreDate = mockDate(2023, 10, 20, 10, 0); // Nov 20 2023 is Monday

    let msg = createMockMessage("user1");
    let ignored = await shouldIgnoreMessage(msg);

    console.log(`Expected ignored: true, Actual: ${ignored}`);
    if (!ignored) console.error("❌ FAILED: Should be ignored outside business hours");
    else console.log("✅ PASSED");

    restoreDate();

    // Test 2: Inside Business Hours (Monday 21:00 PM)
    console.log("\n🧪 Test 2: Inside Business Hours (Monday 21:00 PM)");
    restoreDate = mockDate(2023, 10, 20, 21, 0);

    msg = createMockMessage("user2");
    ignored = await shouldIgnoreMessage(msg);

    console.log(`Expected ignored: false, Actual: ${ignored}`);
    if (ignored) console.error("❌ FAILED: Should NOT be ignored inside business hours");
    else console.log("✅ PASSED");

    // Test 3: Send Welcome Message (State checking)
    console.log("\n🧪 Test 3: Handle Message & Update State");
    if (!ignored) {
        const response = await handleBotMessage(msg);
        console.log(`Response: ${response}`);
        console.log(`State for user2:`, userStates["user2"]);

        if (userStates["user2"] && userStates["user2"].lastWelcomeDate) console.log("✅ PASSED: State updated");
        else console.error("❌ FAILED: State not updated");
    }

    // Test 4: Second message same day (Should ignore)
    console.log("\n🧪 Test 4: Second Message Same Day");
    ignored = await shouldIgnoreMessage(msg);
    console.log(`Expected ignored: true, Actual: ${ignored}`);

    if (!ignored) console.error("❌ FAILED: Should ignore second message on same day");
    else console.log("✅ PASSED");

    restoreDate();

    // Test 5: Next Day (Tuesday 21:00 PM)
    console.log("\n🧪 Test 5: Next Day (Tuesday 21:00 PM)");
    restoreDate = mockDate(2023, 10, 21, 21, 0); // Tuesday

    ignored = await shouldIgnoreMessage(msg); // user2 again
    console.log(`Expected ignored: false, Actual: ${ignored}`);

    if (ignored) console.error("❌ FAILED: Should reply on new day");
    else console.log("✅ PASSED");

    restoreDate();
}

runTests().catch(console.error);
