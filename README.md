# vue-validate
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nguyenthanh1995/vue-validate2/blob/master/LICENSE)  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#)

**A plugin check validate value for vuejs**


## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Installation

``` bash
npm install vue-validate2
```

or

``` bash
yarn add vue-validate2
```

or if you prefer CDN

``` html
<script type="text/javascript" src="https://unpkg.com/vue-touch-scroll@latest/dist/vue-validate2.js"></script>
```

## Usage

``` JavaScript
import { use } from "vue"
import validate2 from "vue-validate2"

use(validate2)

```

``` vue.js
<form class="form-login">
   <div class="input-group">
      <input 
         v-validate.absolute:login="/[\w\d]+@[\w\d]+\.\w{1,}"
         name="email"
         valid-class="input-valid"
         invalid-class="input-invalid"
         class="form-control">
      <span v-show="$validate.$get('login/email/error')"> Wrong email format "{{ $validate.$get('login/email/value/0') }}" </span>
  </div>
</form>
<span v-show="$validate.$get('login/$is')"> Form ready send </span>
```

### Configuration

### Global

| Property | Type | Default | Description |
|:-|:-|:-|:-| 
| valid | String | "vue-validate" | Class add for element if valid |
| invalid | String | "vue-invalidate" | Class add for element if invalid |
 
#### Element

| Property | Type | Default | Description |
|:-|:-|:-|:-|
| name, required, multiple | any | any | This is a attribute tag input |
| valid-class, invalid-class | any | "" | Config local for valid and invalid |

#### Directive

v-validate.[options]:[group name]="[regexp]"
* required: Requred value
* absolute: check all value

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
