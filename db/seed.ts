import { seedRow } from 'better-sqlite3-proxy'
import { proxy } from './proxy'

// This file serve like the knex seed file.
//
// You can setup the database with initial config and sample data via the db proxy.

seedRow(proxy.method, { method: 'GET' })
seedRow(proxy.method, { method: 'POST' })
seedRow(proxy.method, { method: 'ws' })

seedRow(proxy.job, { id: 1 }, { title: 'Frontend Developer', likes: 3 })
seedRow(proxy.job, { id: 2 }, { title: 'Backend Developer', likes: 7 })
seedRow(proxy.job, { id: 3 }, { title: 'Fullstack Developer', likes: 5 })

// console.log(
//   'request methods:',
//   proxy.method.map(row => row.method),
// )
