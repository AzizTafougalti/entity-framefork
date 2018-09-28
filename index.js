class EFW {
    constructor(collection) {
        this.from(collection)
    }
    select(...fields) {
        this.selected = fields
        return this
    }
    run(limit = 10, page = 1) {
        let $return = null
        let startPos = limit * (page - 1)

        if (this.groups.length > 0)
            $return = this.groups.map(group => group.selected)
        else if (this.selected)
            $return = this.collection.map(document => this.constructor.extract(document, ...this.selected))
        else
            $return = this.collection

        return $return.slice(startPos, startPos + limit)
    }
    from(collection) {
        this.collection = [...collection]
        this.selected = null
        this.groups = []
        return this
    }
    where(condition) {
        let tempCollection = []
        for (let document of this.collection) {
            if (condition(document))
                tempCollection.push(document)
        }
        this.collection = tempCollection
        return this
    }
    groupBy(...fields) {
        let group = null

        for (let i = 0; i < this.collection.length; i++) {
            group = { group: [], selected: this.constructor.extract(this.collection[i], ...this.selected) }
            group.group.push(this.collection[i])
            for (let j = i + 1; j < this.collection.length; j++) {
                if (this.constructor.equalFields(this.collection[i], this.collection[j], ...fields)) {
                    group.group.push(this.collection[j])
                    this.collection.splice(j, 1)
                    j--
                }
            }
            this.groups.push(group)
        }
        return this
    }
    having(condition) {
        let tempGroups = []
        for (let group of this.groups) {
            if (condition(group.group)) {
                tempGroups.push(group)
            }
        }
        this.groups = tempGroups
        return this
    }
    static equalFields(document1, document2, ...fields) {
        for (let field of fields) {
            if (document1[field] != document2[field]) {
                return false
            }
        }
        return true
    }
    static extract(document, ...fields) {
        let tempDocument = {}
        for (let field of fields) {
            tempDocument[field] = document[field]
        }
        return tempDocument
    }
    static sum(group, field) {
        let sum = 0
        for (let document of group) {
            sum += document[field]
        }
        return sum
    }
    static avg(group, field) {
        return this.sum(group, field) / group.length
    }
    static min(group, field) {
        let min = group[0][field]
        for (let document of group) {
            if (document[field] < min)
                min = document[field]
        }
        return min
    }
    static max(group, field) {
        let max = group[0][field]
        for (let document of group) {
            if (document[field] > max)
                max = document[field]
        }
        return max
    }
}

let list = [
    { id: 1, title: 'B1', price: 20, pages: 240 },
    { id: 5, title: 'B5', price: 20, pages: 240 },
    { id: 3, title: 'B1', price: 30, pages: 260, ref: 'TRY' },
    { id: 4, title: 'B4', price: 30, pages: 260 },
    { id: 2, title: 'B2', price: 39.99, pages: 160 },
    { id: 6, title: 'B6', price: 15.99, pages: 160 }
]

let efw = new EFW(list)

let result = efw
    .select('price', 'pages', 'ref')
    .where(document => document.price > 20 && document.pages > 160)
    .run(2)

console.log(result)