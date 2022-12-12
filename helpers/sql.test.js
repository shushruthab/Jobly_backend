const { sqlForPartialUpdate } = require("./sql");

describe("To check helper function for Sql update statement", function () {
    test("test when jsToSql is an empty object", function () {
        const result = sqlForPartialUpdate(
            {a: 1, b: 2},
            {}
        )

        expect(result).toEqual({
            setCols: "\"a\"=$1, \"b\"=$2",
            values: [1, 2],
        });
    })

    test("works when jsToSql is not an empty object", function () {
        const result = sqlForPartialUpdate(
            {a: 1, b: 2},
            {a: "c", b: "d"}
        )

        expect(result).toEqual({
            setCols: '"c"=$1, "d"=$2',
            values: [1, 2],
        })
    })


})