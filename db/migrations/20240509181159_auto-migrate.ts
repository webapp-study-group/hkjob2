import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('job'))) {
    await knex.schema.createTable('job', table => {
      table.increments('id')
      table.text('title').notNullable()
      table.integer('likes').notNullable()
      table.timestamps(false, true)
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('job')
}
