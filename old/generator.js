const makeGenerator = function * (from) {
  yield * from
}

const sliceGenerator = async function * (generator, end) {
  // const generator = createGenerator()

  let pass
  let index = 0

  while (true) {
    const result = await generator.next(pass)

    if (result.done || index >= end) return result.value

    pass = yield result.value

    index += 1
  }
}

const unwrapGenerator = async (generator) => {
  while (true) {
    const result = await generator.next()

    if (result.done) return result.value
  }
}

const unwrapAccumulateGenerator = async (generator) => {
  let results = []

  while (true) {
    const result = await generator.next()

    if (result.done) return results

    results.push(result.value)
  }
}

const reduceGenerator = async function * (generator, combine, initial = {}) {
  // const generator = createGenerator()

  let pass
  let accumulator = initial
  let index = 0

  while (true) {
    const result = await generator.next()

    if (result.done) return accumulator

    accumulator = await combine(accumulator, result.value, index)

    index++
  }
}

const filterGenerator = async function * (generator, condition) {
  // const generator = createGenerator()

  let pass
  let index = 0

  while (true) {
    const result = await generator.next(pass)

    if (result.done) return result.value

    if (await condition(result.value, index)) {
      pass = yield result.value
    } else {
      pass = undefined
    }

    index += 1
  }
}

const mapGenerator = async function * (generator, transform) {
  // const generator = createGenerator()

  let pass
  let index = 0

  while (true) {
    const result = await generator.next(pass)

    if (result.done) return result.value

    pass = yield (await transform(result.value, index))

    index += 1
  }
}

const flatMapGenerator = async (generator, transform) => {
  let pass
  let index = 0

  while (true) {
    const result = await generator.next(pass)

    if (result.done) return result.value

    const list = result.value
    const unwrapped = await unwrapAccumulateGenerator(list)

    const page = makeGenerator(unwrapped)

    pass = yield * page

    index += 1
  }
}


const watchGenerator = async function * (generator, withValue) {
  // const generator = createGenerator()

  let pass

  while (true) {
    const result = await generator.next(pass)

    if (result.done) return result.value

    await withValue(result.value)

    pass = yield result.value
  }
}
