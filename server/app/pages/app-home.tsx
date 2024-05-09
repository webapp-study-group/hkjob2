import { loadClientPlugin } from '../../client-plugin.js'
import { apiEndpointTitle, title } from '../../config.js'
import { appIonTabBar } from '../components/app-tab-bar.js'
import { mapArray } from '../components/fragment.js'
import { Link, Redirect } from '../components/router.js'
import { wsStatus } from '../components/ws-status.js'
import { prerender } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { ResolvedPageRoue, Routes } from '../routes.js'
import { fitIonFooter, selectIonTab } from '../styles/mobile-style.js'
import { EarlyTerminate, MessageException } from '../helpers.js'
import { id, object, string } from 'cast.ts'
import { sessions } from '../session.js'
import { ServerMessage } from '../../../client/types.js'
import { proxy } from '../../../db/proxy.js'
import { Context, getContextFormBody } from '../context.js'
import { renderError } from '../components/error.js'
import { IonBackButton } from '../components/ion-back-button.js'

let pageTitle = 'Home'

function HomePage() {
  return (
    <>
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title role="heading" aria-level="1">
            {pageTitle}
          </ion-title>
          <ion-buttons slot="end">
            <Link tagName="ion-button" href="/about" color="light">
              About
            </Link>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p>Total number of jobs: {proxy.job.length}</p>

        <ion-list>
          {mapArray(proxy.job, job => (
            <ion-item data-job-id={job.id} data-title="job">
              <div>
                <b>{job.title}</b>
                <div>
                  <span data-job-id={job.id} data-title="job.likes">
                    {job.likes}
                  </span>{' '}
                  likes
                </div>
              </div>
              <ion-button slot="end" onclick={`emit('/jobs/like',${job.id})`}>
                <ion-icon name="heart" slot="icon-only"></ion-icon>
              </ion-button>
              <ion-button
                slot="start"
                onclick={`emit('/jobs/delete',${job.id})`}
                color="danger"
              >
                <ion-icon name="trash" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-item>
          ))}
        </ion-list>

        <form method="POST" action="/jobs/submit">
          <h2>Job Submission Form</h2>
          <ion-list>
            <ion-item>
              <ion-input label="Job Title" name="title"></ion-input>
            </ion-item>
          </ion-list>
          <ion-button type="submit">Submit</ion-button>
        </form>

        {wsStatus.safeArea}
      </ion-content>
      <ion-footer>
        {appIonTabBar}
        {selectIonTab('home')}
      </ion-footer>
      {fitIonFooter}
    </>
  )
}

let jobLikeParser = object({
  args: object({
    0: id(),
  }),
})
function LikeJob(context: Context): ResolvedPageRoue {
  if (context.type == 'ws') {
    let input = jobLikeParser.parse(context)
    let job_id = input.args[0]
    let job = proxy.job[job_id]
    if (job) {
      job.likes++
      let message: ServerMessage = [
        'update-text',
        `[data-job-id="${job.id}"][data-title="job.likes"]`,
        job.likes,
      ]
      sessions.forEach(session => {
        session.ws.send(message)
      })
    }
  }
  throw EarlyTerminate
}

let jobDeleteParser = object({
  args: object({
    0: id(),
  }),
})
function DeleteJob(context: Context): ResolvedPageRoue {
  if (context.type == 'ws') {
    let input = jobDeleteParser.parse(context)
    let job_id = input.args[0]
    delete proxy.job[job_id]
    let message: ServerMessage = [
      'remove',
      `[data-job-id="${job_id}"][data-title="job"]`,
    ]
    sessions.forEach(session => {
      session.ws.send(message)
    })
  }
  throw EarlyTerminate
}

let jobSubmitParser = object({
  title: string({ minLength: 2 }),
})
function SubmitJob(context: Context): ResolvedPageRoue {
  try {
    let body = getContextFormBody(context)
    let input = jobSubmitParser.parse(body)
    proxy.job.push({
      title: input.title,
      likes: 0,
    })
    return {
      title: apiEndpointTitle,
      description: 'Submit New job',
      node: <Redirect href="/" />,
    }
  } catch (error) {
    return {
      title: apiEndpointTitle,
      description: 'Submit New job',
      node: (
        <>
          <ion-header>
            <ion-toolbar color="danger">
              <IonBackButton href="/" color="light" />
              <ion-title>Submit New Job</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            {renderError(error, context)}
          </ion-content>
        </>
      ),
    }
  }
}

let routes = {
  '/': {
    title: title(pageTitle),
    description:
      'List of fictional characters commonly used as placeholders in discussion about cryptographic systems and protocols.',
    menuText: 'Ionic App',
    menuFullNavigate: true,
    node: <HomePage />,
  },
  '/jobs/like': {
    resolve: LikeJob,
  },
  '/jobs/delete': {
    resolve: DeleteJob,
  },
  '/jobs/submit': {
    streaming: false,
    resolve: SubmitJob,
  },
} satisfies Routes

// CRUD
// C -> Create (Submit Job)
// R -> Retrieval (Home Page show job list)
// U -> Update (update like count)
// D -> Delete (Delete Job)

export default { routes }
