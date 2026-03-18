import { getTextContent, getDateValue } from 'notion-utils'
import api from '@/lib/server/notion-api'

function getPersonIds (value) {
  const ids = new Set()

  function visit (node) {
    if (!Array.isArray(node)) return

    if (node[0] === 'u' && typeof node[1] === 'string') {
      ids.add(node[1])
      return
    }

    node.forEach(visit)
  }

  visit(value)
  return [...ids]
}

async function getPageProperties (id, block, schema) {
  const rawProperties = Object.entries(block?.[id]?.value?.properties || [])
  const excludeProperties = ['date', 'select', 'multi_select', 'person', 'status', 'checkbox']
  const properties = {}
  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    properties.id = id
    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[schema[key].name] = getTextContent(val)
    } else {
      switch (schema[key]?.type) {
        case 'date': {
          const dateProperty = getDateValue(val)
          delete dateProperty.type
          properties[schema[key].name] = dateProperty
          break
        }
        case 'select':
        case 'status':
        case 'multi_select': {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[schema[key].name] = selects.split(',')
          }
          break
        }
        case 'checkbox': {
          properties[schema[key].name] = getTextContent(val) === 'Yes'
          break
        }
        case 'person': {
          const rawUsers = getPersonIds(val)
          const res = rawUsers.length ? await api.getUsers(rawUsers) : null
          const users = []
          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i]) {
              const userId = rawUsers[i]
              const resValue = res?.recordMapWithRoles?.notion_user?.[userId]?.value
              const user = {
                id: resValue?.id,
                first_name: resValue?.given_name,
                last_name: resValue?.family_name,
                profile_photo: resValue?.profile_photo
              }
              if (user.id) {
                users.push(user)
              }
            }
          }
          properties[schema[key].name] = users
          break
        }
        default:
          break
      }
    }
  }
  return properties
}

export { getPageProperties as default }
