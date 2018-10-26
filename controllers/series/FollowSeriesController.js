import db from '../../models';
import SeriesHelper from '../../helpers/SeriesHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';
import eventBus from '../../helpers/eventBus';

const {
  FollowSeries
} = db;

/**
 * Crud controller for Series entity
 */
export default class FollowSeriesController {
  /**
   *
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {Promise<void>} Allow a user follow or unfollow a particular series.
   */
  static async followSeries(req, res, next) {
    try {
      const { slug, follow } = req.params;
      const { userId } = req.authData;
      const series = await SeriesHelper.findSeriesBySlug(slug, []);

      HttpError.throwErrorIfNull(series, 'Series not found');
      if (userId === series.userId) {
        HttpError.throwErrorIfNull(null, 'Author of this series cannot follow this series', 403);
      }
      await FollowSeriesController.follow(userId, series, follow);

      if (follow === 'follow') {
        eventBus.emit('onFollowSeriesEvent', {
          slug: series.slug,
          fromUser: userId,
          event: follow
        });
      }

      res.status(200)
        .json({
          message: `Successfully ${follow}ed this series ${series.title}`,
          status: 'success'
        });
    } catch (e) {
      next(e);
    }
  }

  /**
   *
   * @param {number} userId - id of the user to follow the series
   * @param {Series} series - series to follow or unfollow
   * @param {'follow'|'unfollow'} follow - status of the follow event
   * @return {Promise<void>} Create or update follow series relationship
   */
  static async follow(userId, series, follow) {
    const status = follow.toUpperCase();

    const followSeries = await FollowSeries.findOne({
      where: {
        userId,
        seriesId: series.id
      }
    });

    if (followSeries) {
      await followSeries.update({ status });
    } else if (follow === 'follow') {
      await FollowSeries.create({
        userId,
        status,
        seriesId: series.id
      });
    } else {
      HttpError.throwErrorIfNull(null, 'Cannot unfollow a series you have not followed', 403);
    }
  }
}
