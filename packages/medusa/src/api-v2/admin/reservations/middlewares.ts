import * as QueryConfig from "./query-config"

import { MiddlewareRoute } from "../../../loaders/helpers/routing/types"
import { authenticate } from "../../../utils/middlewares/authenticate-middleware"
import { validateAndTransformQuery } from "../../utils/validate-query"
import {
  AdminCreateReservation,
  AdminGetReservationParams,
  AdminGetReservationsParams,
  AdminUpdateReservation,
} from "./validators"
import { validateAndTransformBody } from "../../utils/validate-body"

export const adminReservationRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["ALL"],
    matcher: "/admin/reservations*",
    middlewares: [authenticate("admin", ["bearer", "session", "api-key"])],
  },
  {
    method: ["GET"],
    matcher: "/admin/reservations",
    middlewares: [
      validateAndTransformQuery(
        AdminGetReservationsParams,
        QueryConfig.listTransformQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/reservations/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetReservationParams,
        QueryConfig.retrieveTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/reservations",
    middlewares: [
      validateAndTransformBody(AdminCreateReservation),
      validateAndTransformQuery(
        AdminGetReservationParams,
        QueryConfig.retrieveTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/reservations/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdateReservation),
      validateAndTransformQuery(
        AdminGetReservationParams,
        QueryConfig.retrieveTransformQueryConfig
      ),
    ],
  },
]
