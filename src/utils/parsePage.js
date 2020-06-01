/* eslint-disable no-param-reassign */

export default function parsePage(page, max = Infinity) {
  page = parseInt(page, 10) - 1;
  if (isNaN(page)) page = 0;
  else if (page < 0) page = 0;
  else if (page >= max) page = max - 1;
  return page;
}
