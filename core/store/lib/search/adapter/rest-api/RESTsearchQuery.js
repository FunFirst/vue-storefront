import getMapping from '../../mapping'
import cloneDeep from 'lodash-es/cloneDeep'

const expand = function (str, value) {
  let items = str.split('.') // split on dot notation
  let output = {} // prepare an empty object, to fill later
  let ref = output // keep a reference of the new object

  //  loop through all nodes, except the last one
  for (let i = 0; i < items.length - 1; i++) {
    ref[items[i]] = {} // create a new element inside the reference
    ref = ref[items[i]] // shift the reference to the newly created object
  }

  ref[items[items.length - 1]] = value // apply the final value

  return output // return the full object
}

export function prepareRESTQueryBody (searchQuery) {
  // const optionsPrfeix = '_options'
  // const queryText = searchQuery.getSearchText()
  const rangeOperators = ['gt', 'lt', 'gte', 'lte', 'moreq', 'from', 'to']
  let query = {}

  const addParam = (query, attribute, value) => {
    if (Array.isArray(value) && value.length === 1) {
      value = value[0]
    }
    if (attribute.indexOf('.') > -1) {
      Object.assign(query, expand(attribute, value))
    } else {
      query[attribute] = value
    }
  }

  // const addAttribute = (query, attribute, value, operator = 'eq') => {
  //   if (!query.hasOwnProperty('attributes')) {
  //     Object.defineProperty(query, 'attributes', {})
  //   }
  //   // addParam(query['attributes'], operator, value)
  // }
  // process applied filters
  const appliedFilters = cloneDeep(searchQuery.getAppliedFilters()) // copy as function below modifies the object
  if (appliedFilters.length > 0) {
    // apply default filters
    appliedFilters.forEach(filter => {
      console.debug(filter.value)
      if (filter.scope === 'default') {
        if (rangeOperators.every(rangeOperator => filter.value.hasOwnProperty(rangeOperator))) {
          // process range filters
          // query = query.filter('range', filter.attribute, filter.value)
          rangeOperators.every(rangeOperator => {
            if (filter.value.hasOwnProperty(rangeOperator)) {
              query[filter.attribute][rangeOperator] = filter.value[rangeOperator]
              addParam(query, getMapping(filter.attribute + '.' + rangeOperator), filter.value[rangeOperator])
            }
          })
        } else {
          // process terms filters
          filter.value = filter.value[Object.keys(filter.value)[0]]
          if (!Array.isArray(filter.value)) {
            filter.value = filter.value
          }
          // query = query.filter('terms', getMapping(filter.attribute), filter.value)
          // addAttribute(query, getMapping(filter.attribute), filter.value)
          console.debug('No range operator', query, filter)
          // query[getMapping(filter.attribute)] = filter.value
          addParam(query, getMapping(filter.attribute), filter.value)
        }
      }
    })

    if (searchQuery.getSearchText()) {
      addParam(query, 'search', searchQuery.getSearchText())
    }

    // apply catalog scope filters∆
    appliedFilters.forEach(catalogfilter => {
      const valueKeys = Object.keys(catalogfilter.value)
      if (catalogfilter.scope === 'catalog' && valueKeys.length) {
        const isRange = valueKeys.filter(value => rangeOperators.indexOf(value) !== -1)
        if (isRange.length) {
          let rangeAttribute = catalogfilter.attribute
          // filter by product fiunal price
          if (rangeAttribute === 'price') {
            rangeAttribute = 'final_price'
          }
          // process range filters
          isRange.forEach(rangeKey => {
            addParam(query, rangeAttribute + '.' + rangeKey, catalogfilter.value[rangeKey])
          })
        } else {
          // process terms filters
          let newValue = catalogfilter.value[Object.keys(catalogfilter.value)[0]]

          addParam(query, getMapping(catalogfilter.attribute), newValue)
        }
      }
    })

    console.debug(query)
  }

  // TODO Aggregation

  return query
}
